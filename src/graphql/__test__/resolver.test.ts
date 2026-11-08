import {ApolloServer} from "@apollo/server";
import Schema from "../schema";
import Resolver from "../resolver";
import * as dataset from "../../db/dataset";
import {ProductFeaturedProfile, RegistrationFeaturedProfile} from "../../feature/feature";
import {User} from "../../types";

jest.mock("../../db/dataset");

const mocked = jest.mocked(dataset);

const user = {id: 1, username: "ada", email: "ada@example.com", created_at: "c", updated_at: "u"} as unknown as User;

describe('GraphQL featured profile queries', () => {
    const server = new ApolloServer({typeDefs: Schema, resolvers: Resolver});

    beforeAll(() => server.start());
    afterAll(() => server.stop());
    beforeEach(() => jest.resetAllMocks());

    async function run(query: string, variables?: Record<string, unknown>) {
        const response = await server.executeOperation({query, variables});
        if (response.body.kind !== 'single') {
            throw new Error('expected a single response');
        }
        return response.body.singleResult;
    }

    it('resolves a registration profile including the nested featured_profile', async () => {
        const profile = new RegistrationFeaturedProfile();
        profile.produceFeaturedProfile();
        Object.assign(profile, {id: 3, user});
        mocked.getRegistrationFeaturedProfile.mockResolvedValue(profile);

        const result = await run(`
            query ($id: Int) {
                getRegistrationFeaturedProfile(id: $id) {
                    registration_featured_profile_state
                    featured_profile { id user { username } }
                }
            }`, {id: 3});

        expect(result.errors).toBeUndefined();
        expect(result.data).toEqual({
            getRegistrationFeaturedProfile: {
                registration_featured_profile_state: 'PENDING',
                featured_profile: {id: '3', user: {username: 'ada'}},
            },
        });
    });

    it('resolves all product profiles', async () => {
        const profile = new ProductFeaturedProfile();
        profile.produceFeaturedProfile();
        Object.assign(profile, {id: 5, user});
        mocked.getAllProductFeaturedProfiles.mockResolvedValue([profile]);

        const result = await run(`
            {
                getAllProductFeaturedProfiles {
                    product_featured_profile_state
                    product_featured_profile_timestamp
                    featured_profile { id }
                }
            }`);

        expect(result.errors).toBeUndefined();
        expect(result.data).toMatchObject({
            getAllProductFeaturedProfiles: [{
                product_featured_profile_state: 'OPEN',
                featured_profile: {id: '5'},
            }],
        });
    });

    it('creates a registration profile for the given user', async () => {
        const profile = new RegistrationFeaturedProfile();
        profile.produceFeaturedProfile();
        Object.assign(profile, {id: 9, user});
        mocked.createRegistrationFeaturedProfile.mockResolvedValue(profile);

        const result = await run(`
            mutation {
                createRegistrationFeaturedProfile(user_id: 1) {
                    registration_featured_profile_state
                    featured_profile { id }
                }
            }`);

        expect(result.errors).toBeUndefined();
        expect(mocked.createRegistrationFeaturedProfile).toHaveBeenCalledWith(1);
        expect(result.data).toMatchObject({
            createRegistrationFeaturedProfile: {featured_profile: {id: '9'}},
        });
    });
});
