import request from 'supertest';
import express from 'express';
import {setupEndpoints} from '../endpoints';
import * as dataset from '../../db/dataset';
import {ProductFeaturedProfile, RegistrationFeaturedProfile} from '../../feature/feature';
import {User} from '../../types';

jest.mock('../../db/dataset');
jest.mock('../../cloud/cloud-resolver');

const mocked = jest.mocked(dataset);

const app = express();
app.use(express.json());
setupEndpoints(app);

const user = {id: 1, username: 'ada', email: 'ada@example.com'} as User;

function registrationProfile(id: number): RegistrationFeaturedProfile {
    const profile = new RegistrationFeaturedProfile();
    profile.produceFeaturedProfile();
    Object.assign(profile, {id, user});
    return profile;
}

function productProfile(id: number): ProductFeaturedProfile {
    const profile = new ProductFeaturedProfile();
    profile.produceFeaturedProfile();
    Object.assign(profile, {id, user});
    return profile;
}

describe('GET /api/v1', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => jest.restoreAllMocks());

    it('/categories returns the categories in an object', async () => {
        mocked.getCategories.mockResolvedValue([{id: 1, name: 'Books', sorting: 0}]);

        const response = await request(app).get('/api/v1/categories');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({categories: [{id: 1, name: 'Books', sorting: 0}]});
    });

    it('/registrationFeaturedProfiles returns registration profiles, not product profiles', async () => {
        mocked.getAllRegistrationFeaturedProfiles.mockResolvedValue([registrationProfile(2)]);

        const response = await request(app).get('/api/v1/registrationFeaturedProfiles');

        expect(response.status).toBe(200);
        expect(mocked.getAllProductFeaturedProfiles).not.toHaveBeenCalled();
        expect(response.body.registrationFeaturedProfiles).toHaveLength(1);
        expect(response.body.registrationFeaturedProfiles[0]).toMatchObject({
            id: 2,
            registration_featured_profile_state: 'PENDING',
        });
    });

    it('/productFeaturedProfiles returns product profiles', async () => {
        mocked.getAllProductFeaturedProfiles.mockResolvedValue([productProfile(4)]);

        const response = await request(app).get('/api/v1/productFeaturedProfiles');

        expect(response.status).toBe(200);
        expect(response.body.productFeaturedProfiles[0]).toMatchObject({
            id: 4,
            product_featured_profile_state: 'OPEN',
        });
    });

    it('/dashboard returns all three collections', async () => {
        mocked.getCategories.mockResolvedValue([]);
        mocked.getAllProductFeaturedProfiles.mockResolvedValue([productProfile(4)]);
        mocked.getAllRegistrationFeaturedProfiles.mockResolvedValue([registrationProfile(2)]);

        const response = await request(app).get('/api/v1/dashboard');

        expect(response.status).toBe(200);
        expect(Object.keys(response.body).sort()).toEqual(
            ['categories', 'productFeaturedProfiles', 'registrationFeaturedProfiles']);
        expect(response.body.registrationFeaturedProfiles[0]).toHaveProperty('registration_featured_profile_state');
    });

    it('responds with 500 and a JSON message when the database fails', async () => {
        mocked.getCategories.mockRejectedValue(new Error('db down'));

        const response = await request(app).get('/api/v1/categories');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({message: 'Internal server error'});
    });
});
