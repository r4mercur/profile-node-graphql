import {PoolClient} from "pg";
import bcrypt from "bcrypt";
import {withClient} from "./db";
import {Category, FakeUser, User} from "../types";
import {
    FeaturedProfile,
    FeaturedProfileType,
    ProductFeaturedProfile,
    ProductFeaturedProfileState,
    RegistrationFeaturedProfile,
    RegistrationFeaturedProfileState
} from "../feature/feature";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<User[]> {
    return withClient(async client => {
        const res = await client.query<User>(`SELECT id, username, email, created_at, updated_at
                                              FROM "user"`);
        return res.rows;
    });
}

export async function getUser(id: number): Promise<User> {
    return withClient(async client => {
        const res = await client.query<User>(`SELECT *
                                              FROM "user"
                                              WHERE id = $1`, [id]);
        return res.rows[0];
    });
}

export async function createUser({username, email, password}: {
    username: string,
    email: string,
    password: string
}): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return withClient(async client => {
        const res = await client.query<User>(`INSERT INTO "user" (username, email, password, created_at, updated_at)
                                              VALUES ($1, $2, $3, now(), now())
                                              RETURNING *`, [username, email, hashedPassword]);
        return res.rows[0];
    });
}

export async function createUserWithFakeUser(fake_user: FakeUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(fake_user.password, 10);

    return withClient(async client => {
        const res = await client.query<User>(`INSERT INTO "user" (username, email, password, avatar_url, created_at, updated_at)
                                              VALUES ($1, $2, $3, $4, now(), now())
                                              RETURNING *`, [fake_user.username, fake_user.email, hashedPassword, fake_user.avatar_url]);
        return res.rows[0];
    });
}

export async function loginUser({email, password}: { email: string, password: string }): Promise<User | null> {
    return withClient(async client => {
        const res = await client.query<User>(`SELECT *
                                              FROM "user"
                                              WHERE email = $1`, [email]);
        const user = res.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }

        return null;
    });
}

export async function updateUser({id, username, email, password}: {
    id: number,
    username: string,
    email: string,
    password: string
}): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return withClient(async client => {
        const res = await client.query<User>(`UPDATE "user"
                                              SET username   = $1,
                                                  email      = $2,
                                                  password   = $3,
                                                  updated_at = now()
                                              WHERE id = $4
                                              RETURNING *`, [username, email, hashedPassword, id]);
        return res.rows[0];
    });
}

export async function updateUserAvatar(userId: number, avatarUrl: string): Promise<User> {
    return withClient(async client => {
        const res = await client.query<User>(`UPDATE "user"
                                              SET avatar_url = $1,
                                                  updated_at = now()
                                              WHERE id = $2
                                              RETURNING *`, [avatarUrl, userId]);
        return res.rows[0];
    });
}

export async function deleteUser(id: number): Promise<User> {
    return withClient(async client => {
        const res = await client.query<User>(`DELETE
                                              FROM "user"
                                              WHERE id = $1
                                              RETURNING *`, [id]);
        return res.rows[0];
    });
}

/**
 * Loads all given users with a single query, so listing profiles does not need one query per row.
 */
async function getUsersById(client: PoolClient, ids: number[]): Promise<Map<number, User>> {
    if (ids.length === 0) {
        return new Map();
    }

    const res = await client.query<User>(`SELECT *
                                          FROM "user"
                                          WHERE id = ANY ($1::int[])`, [[...new Set(ids)]]);
    return new Map(res.rows.map(user => [user.id, user]));
}

// ---------------------------------------------------------------------------
// Featured profiles
// ---------------------------------------------------------------------------

interface FeaturedProfileRow {
    id: number;
    user_id: number;
    registration_featured_profile_state: RegistrationFeaturedProfileState | null;
    product_featured_profile_state: ProductFeaturedProfileState | null;
    product_featured_profile_timestamp: Date | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Describes how one type of featured profile maps to and from the shared `featured_profile` table.
 */
interface FeaturedProfileKind<T extends FeaturedProfile> {
    type: FeaturedProfileType;
    label: string;
    create(): T;
    fromRow(row: FeaturedProfileRow, user: User): T;
    toColumns(profile: T): Pick<FeaturedProfileRow,
        'registration_featured_profile_state' | 'product_featured_profile_state' | 'product_featured_profile_timestamp'>;
}

function applyCommonFields(profile: FeaturedProfile, row: FeaturedProfileRow, user: User) {
    profile.id = row.id;
    profile.user = user;
    profile.created_at = row.created_at;
    profile.updated_at = row.updated_at;
}

const registrationKind: FeaturedProfileKind<RegistrationFeaturedProfile> = {
    type: FeaturedProfileType.REGISTRATION,
    label: 'RegistrationFeaturedProfile',
    create: () => new RegistrationFeaturedProfile(),
    fromRow: (row, user) => {
        const profile = new RegistrationFeaturedProfile();
        applyCommonFields(profile, row, user);
        profile.registrationFeaturedProfileState = row.registration_featured_profile_state!;
        return profile;
    },
    toColumns: profile => ({
        registration_featured_profile_state: profile.registrationFeaturedProfileState,
        product_featured_profile_state: null,
        product_featured_profile_timestamp: null,
    }),
};

const productKind: FeaturedProfileKind<ProductFeaturedProfile> = {
    type: FeaturedProfileType.PRODUCT,
    label: 'ProductFeaturedProfile',
    create: () => new ProductFeaturedProfile(),
    fromRow: (row, user) => {
        const profile = new ProductFeaturedProfile();
        applyCommonFields(profile, row, user);
        profile.productFeaturedProfileState = row.product_featured_profile_state!;
        profile.productFeaturedProfileTimestamp = row.product_featured_profile_timestamp!;
        return profile;
    },
    toColumns: profile => ({
        registration_featured_profile_state: null,
        product_featured_profile_state: profile.productFeaturedProfileState,
        product_featured_profile_timestamp: profile.productFeaturedProfileTimestamp,
    }),
};

async function findProfiles<T extends FeaturedProfile>(kind: FeaturedProfileKind<T>, id?: number): Promise<T[]> {
    return withClient(async client => {
        const params: unknown[] = [kind.type];
        let where = 'featured_profile_type = $1';

        if (id !== undefined) {
            params.push(id);
            where += ' AND id = $2';
        }

        const res = await client.query<FeaturedProfileRow>(
            `SELECT *
             FROM featured_profile
             WHERE ${where}
             ORDER BY id`,
            params
        );

        const users = await getUsersById(client, res.rows.map(row => row.user_id));
        return res.rows.map(row => kind.fromRow(row, users.get(row.user_id)!));
    });
}

async function findProfile<T extends FeaturedProfile>(kind: FeaturedProfileKind<T>, id: number): Promise<T> {
    const [profile] = await findProfiles(kind, id);

    if (!profile) {
        throw new Error(`${kind.label} with id ${id} not found`);
    }

    return profile;
}

async function insertProfile<T extends FeaturedProfile>(kind: FeaturedProfileKind<T>, userId: number): Promise<T> {
    const draft = kind.create();
    draft.produceFeaturedProfile();
    const columns = kind.toColumns(draft);

    return withClient(async client => {
        const res = await client.query<FeaturedProfileRow>(
            `INSERT INTO featured_profile (user_id, featured_profile_type, registration_featured_profile_state,
                                           product_featured_profile_state, product_featured_profile_timestamp,
                                           created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, now(), now())
             RETURNING *`,
            [
                userId,
                kind.type,
                columns.registration_featured_profile_state,
                columns.product_featured_profile_state,
                columns.product_featured_profile_timestamp
            ]
        );

        const users = await getUsersById(client, [userId]);
        return kind.fromRow(res.rows[0], users.get(userId)!);
    });
}

export const getRegistrationFeaturedProfile = (id: number) => findProfile(registrationKind, id);
export const getAllRegistrationFeaturedProfiles = () => findProfiles(registrationKind);
export const createRegistrationFeaturedProfile = (userId: number) => insertProfile(registrationKind, userId);

export const getProductFeaturedProfile = (id: number) => findProfile(productKind, id);
export const getAllProductFeaturedProfiles = () => findProfiles(productKind);
export const createProductFeaturedProfile = (userId: number) => insertProfile(productKind, userId);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createCategory(category: Category): Promise<Category> {
    return withClient(async client => {
        const res = await client.query<Category>(`INSERT INTO category (name, sorting, created_at, updated_at)
                                                  VALUES ($1, $2, now(), now())
                                                  RETURNING *`, [category.name, category.sorting]);
        return res.rows[0];
    });
}

export async function getCategories(): Promise<Category[]> {
    return withClient(async client => {
        const res = await client.query<Category>(`SELECT *
                                                  FROM category
                                                  ORDER BY sorting`);
        return res.rows;
    });
}
