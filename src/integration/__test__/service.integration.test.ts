import path from "node:path";
import {Client} from "pg";
import {GenericContainer, Network, StartedNetwork, StartedTestContainer, Wait} from "testcontainers";

/**
 * Black-box integration test of the whole service.
 *
 * It builds the image from the project's Dockerfile (Bun) and starts it next to a real Postgres
 * (schema from src/sql/schema.sql) and a fake Google Cloud Storage server, then talks to the
 * service only over HTTP: every GraphQL operation and every REST endpoint.
 *
 * The tests build on each other (e.g. the user created first is used for the profiles later on),
 * so they must run in order. Run with `npm run test:integration`; Docker is required.
 */

const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const BUCKET = "nodegraphql-user-avatar";

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

describe("service integration (Bun container, Postgres, fake GCS)", () => {
    let network: StartedNetwork;
    let database: StartedTestContainer;
    let storage: StartedTestContainer;
    let service: StartedTestContainer;
    let baseUrl: string;

    beforeAll(async () => {
        network = await new Network().start();

        database = await new GenericContainer("postgres:17-alpine")
            .withNetwork(network)
            .withNetworkAliases("db")
            .withEnvironment({POSTGRES_PASSWORD: "password"})
            .withCopyFilesToContainer([{
                source: path.join(PROJECT_ROOT, "src/sql/schema.sql"),
                target: "/docker-entrypoint-initdb.d/schema.sql",
            }])
            .withExposedPorts(5432)
            // Postgres starts twice during init (temporary server, then the real one).
            .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections", 2))
            .start();

        storage = await new GenericContainer("fsouza/fake-gcs-server")
            .withNetwork(network)
            .withNetworkAliases("gcs")
            .withCommand(["-scheme", "http", "-port", "4443"])
            .withExposedPorts(4443)
            .withWaitStrategy(Wait.forHttp("/storage/v1/b", 4443))
            .start();

        const bucketResponse = await fetch(`${storageUrl()}/storage/v1/b?project=test`, {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify({name: BUCKET}),
        });
        expect(bucketResponse.status).toBe(200);

        const image = await GenericContainer
            .fromDockerfile(PROJECT_ROOT)
            .build("profile-node-graphql:integration-test", {deleteOnExit: false});

        service = await image
            .withNetwork(network)
            .withEnvironment({
                DB_HOST: "db",
                DB_PASSWORD: "password",
                // RabbitMQ is not part of the HTTP API, the service logs the failed connection and carries on.
                RABBIT_HOST: "rabbit",
                STORAGE_EMULATOR_HOST: "http://gcs:4443",
            })
            .withExposedPorts(4000)
            // Ready as soon as an endpoint that needs the database answers.
            .withWaitStrategy(Wait.forHttp("/api/v1/categories", 4000).forStatusCode(200))
            .start();

        baseUrl = `http://${service.getHost()}:${service.getMappedPort(4000)}`;

        await seedCategories();
    }, 300_000);

    afterAll(async () => {
        await service?.stop();
        await storage?.stop();
        await database?.stop();
        await network?.stop();
    }, 60_000);

    function storageUrl() {
        return `http://${storage.getHost()}:${storage.getMappedPort(4443)}`;
    }

    // There is no mutation or endpoint for categories, so they are inserted directly.
    async function seedCategories() {
        const client = new Client({
            host: database.getHost(),
            port: database.getMappedPort(5432),
            user: "postgres",
            password: "password",
            database: "postgres",
        });
        await client.connect();
        try {
            await client.query(`INSERT INTO category (name, sorting, created_at, updated_at)
                                VALUES ('Books', 2, now(), now()),
                                       ('Games', 1, now(), now())`);
        } finally {
            await client.end();
        }
    }

    async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
        const response = await fetch(`${baseUrl}/graphql`, {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify({query, variables}),
        });
        return response.json() as Promise<GraphQLResponse<T>>;
    }

    async function rest<T = any>(pathname: string): Promise<{ status: number; body: T }> {
        const response = await fetch(`${baseUrl}/api/v1${pathname}`);
        return {status: response.status, body: await response.json() as T};
    }

    // State shared between the ordered tests below.
    const credentials = {username: "ada", email: "ada@example.com", password: "s3cret-pw"};
    let userId: string;

    describe("GraphQL", () => {
        it("createUser creates a user", async () => {
            const result = await gql<{ createUser: { id: string; username: string; email: string } }>(`
                mutation ($username: String!, $email: String!, $password: String!) {
                    createUser(username: $username, email: $email, password: $password) { id username email }
                }`, credentials);

            expect(result.errors).toBeUndefined();
            expect(result.data!.createUser).toMatchObject({username: "ada", email: "ada@example.com"});
            userId = result.data!.createUser.id;
        });

        it("getAllUsers lists the created user", async () => {
            const result = await gql<{ getAllUsers: { id: string; username: string }[] }>(
                `{ getAllUsers { id username } }`);

            expect(result.errors).toBeUndefined();
            expect(result.data!.getAllUsers).toContainEqual({id: userId, username: "ada"});
        });

        it("login returns a token and the user for valid credentials", async () => {
            const result = await gql<{ login: { token: string; user: { email: string } } }>(`
                mutation ($email: String!, $password: String!) {
                    login(email: $email, password: $password) { token user { email } }
                }`, {email: credentials.email, password: credentials.password});

            expect(result.errors).toBeUndefined();
            expect(result.data!.login.user.email).toBe(credentials.email);
            expect(result.data!.login.token.split(".")).toHaveLength(3);
        });

        it("login fails for a wrong password", async () => {
            const result = await gql(`
                mutation { login(email: "ada@example.com", password: "wrong") { token } }`);

            expect(result.errors?.[0].message).toBe("Invalid email or password");
        });

        it("updateUser changes the user and the new password works", async () => {
            const updated = await gql<{ updateUser: { id: string; username: string } }>(`
                mutation ($id: Int!) {
                    updateUser(id: $id, username: "ada-lovelace", email: "ada@example.com", password: "new-pw-123") {
                        id username
                    }
                }`, {id: Number(userId)});

            expect(updated.errors).toBeUndefined();
            expect(updated.data!.updateUser).toEqual({id: userId, username: "ada-lovelace"});

            const login = await gql<{ login: { token: string } }>(`
                mutation { login(email: "ada@example.com", password: "new-pw-123") { token } }`);
            expect(login.errors).toBeUndefined();
            expect(login.data!.login.token).toBeTruthy();
        });

        it("createRegistrationFeaturedProfile creates a PENDING profile", async () => {
            const result = await gql<{ createRegistrationFeaturedProfile: any }>(`
                mutation ($userId: Int!) {
                    createRegistrationFeaturedProfile(user_id: $userId) {
                        registration_featured_profile_state
                        featured_profile { id user { id username } }
                    }
                }`, {userId: Number(userId)});

            expect(result.errors).toBeUndefined();
            expect(result.data!.createRegistrationFeaturedProfile).toMatchObject({
                registration_featured_profile_state: "PENDING",
                featured_profile: {user: {id: userId, username: "ada-lovelace"}},
            });
        });

        it("createProductFeaturedProfile creates an OPEN profile", async () => {
            const result = await gql<{ createProductFeaturedProfile: any }>(`
                mutation ($userId: Int!) {
                    createProductFeaturedProfile(user_id: $userId) {
                        product_featured_profile_state
                        product_featured_profile_timestamp
                        featured_profile { id user { id } }
                    }
                }`, {userId: Number(userId)});

            expect(result.errors).toBeUndefined();
            expect(result.data!.createProductFeaturedProfile).toMatchObject({
                product_featured_profile_state: "OPEN",
                featured_profile: {user: {id: userId}},
            });
            expect(result.data!.createProductFeaturedProfile.product_featured_profile_timestamp).toBeTruthy();
        });

        it("getAllRegistrationFeaturedProfiles lists the registration profile", async () => {
            const result = await gql<{ getAllRegistrationFeaturedProfiles: any[] }>(`
                { getAllRegistrationFeaturedProfiles {
                    registration_featured_profile_state
                    featured_profile { user { id } }
                } }`);

            expect(result.errors).toBeUndefined();
            expect(result.data!.getAllRegistrationFeaturedProfiles).toEqual([{
                registration_featured_profile_state: "PENDING",
                featured_profile: {user: {id: userId}},
            }]);
        });

        it("getAllProductFeaturedProfiles lists the product profile", async () => {
            const result = await gql<{ getAllProductFeaturedProfiles: any[] }>(`
                { getAllProductFeaturedProfiles {
                    product_featured_profile_state
                    featured_profile { user { id } }
                } }`);

            expect(result.errors).toBeUndefined();
            expect(result.data!.getAllProductFeaturedProfiles).toEqual([{
                product_featured_profile_state: "OPEN",
                featured_profile: {user: {id: userId}},
            }]);
        });

        it("getAllCategories returns the categories ordered by sorting", async () => {
            const result = await gql<{ getAllCategories: { name: string; sorting: number }[] }>(
                `{ getAllCategories { name sorting } }`);

            expect(result.errors).toBeUndefined();
            expect(result.data!.getAllCategories).toEqual([
                {name: "Games", sorting: 1},
                {name: "Books", sorting: 2},
            ]);
        });

        it("deleteUser removes a user", async () => {
            const created = await gql<{ createUser: { id: string } }>(`
                mutation { createUser(username: "temp", email: "temp@example.com", password: "tmp-pw") { id } }`);
            const tempId = created.data!.createUser.id;

            const deleted = await gql<{ deleteUser: { id: string; username: string } }>(`
                mutation ($id: Int!) { deleteUser(id: $id) { id username } }`, {id: Number(tempId)});
            expect(deleted.errors).toBeUndefined();
            expect(deleted.data!.deleteUser).toEqual({id: tempId, username: "temp"});

            const users = await gql<{ getAllUsers: { id: string }[] }>(`{ getAllUsers { id } }`);
            expect(users.data!.getAllUsers.map(user => user.id)).not.toContain(tempId);
        });
    });

    describe("REST /api/v1", () => {
        it("GET /categories", async () => {
            const {status, body} = await rest("/categories");

            expect(status).toBe(200);
            expect(body.categories.map((category: any) => category.name)).toEqual(["Games", "Books"]);
        });

        it("GET /registrationFeaturedProfiles", async () => {
            const {status, body} = await rest("/registrationFeaturedProfiles");

            expect(status).toBe(200);
            expect(body.registrationFeaturedProfiles).toHaveLength(1);
            expect(body.registrationFeaturedProfiles[0]).toMatchObject({
                registration_featured_profile_state: "PENDING",
                user: {id: Number(userId), username: "ada-lovelace"},
            });
        });

        it("GET /productFeaturedProfiles", async () => {
            const {status, body} = await rest("/productFeaturedProfiles");

            expect(status).toBe(200);
            expect(body.productFeaturedProfiles).toHaveLength(1);
            expect(body.productFeaturedProfiles[0]).toMatchObject({
                product_featured_profile_state: "OPEN",
                user: {id: Number(userId)},
            });
        });

        it("GET /dashboard combines all collections", async () => {
            const {status, body} = await rest("/dashboard");

            expect(status).toBe(200);
            expect(Object.keys(body).sort()).toEqual(
                ["categories", "productFeaturedProfiles", "registrationFeaturedProfiles"]);
            expect(body.categories).toHaveLength(2);
            expect(body.productFeaturedProfiles).toHaveLength(1);
            expect(body.registrationFeaturedProfiles).toHaveLength(1);
        });

        it("POST /avatar/upload stores the file and returns its URL", async () => {
            const form = new FormData();
            form.append("file", new Blob(["fake image bytes"], {type: "image/png"}), "avatar.png");

            const response = await fetch(`${baseUrl}/api/v1/avatar/upload`, {method: "POST", body: form});
            const body = await response.json() as { fileUrl: string };

            expect(response.status).toBe(200);
            expect(body.fileUrl).toMatch(
                new RegExp(`^https://storage\\.googleapis\\.com/${BUCKET}/[0-9a-f-]{36}\\.png$`));

            // The object really arrived in the (fake) bucket.
            const objectName = body.fileUrl.split("/").pop()!;
            const listing = await fetch(`${storageUrl()}/storage/v1/b/${BUCKET}/o`);
            const objects = (await listing.json() as { items: { name: string }[] }).items;
            expect(objects.map(object => object.name)).toContain(objectName);
        });

        it("POST /avatar/upload without a file returns 400", async () => {
            const response = await fetch(`${baseUrl}/api/v1/avatar/upload`, {method: "POST"});

            expect(response.status).toBe(400);
            expect(await response.text()).toBe("No file uploaded.");
        });

        it("unknown routes return 404", async () => {
            const response = await fetch(`${baseUrl}/api/v1/does-not-exist`);

            expect(response.status).toBe(404);
        });
    });
});
