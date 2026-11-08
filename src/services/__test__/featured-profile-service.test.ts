import * as dataset from "../../db/dataset";
import {ProductFeaturedProfile, RegistrationFeaturedProfile} from "../../feature/feature";
import {User} from "../../types";
import {
    createProductProfile,
    findRegistrationProfile,
    listProductProfiles,
    listRegistrationProfiles
} from "../featured-profile-service";
import {getDashboard} from "../dashboard-service";

jest.mock("../../db/dataset");

const mocked = jest.mocked(dataset);

const user = {id: 1, username: "ada", email: "ada@example.com"} as User;
const created = new Date("2024-01-01T00:00:00Z");
const updated = new Date("2024-01-02T00:00:00Z");

function registrationProfile(id: number): RegistrationFeaturedProfile {
    const profile = new RegistrationFeaturedProfile();
    profile.produceFeaturedProfile();
    Object.assign(profile, {id, user, created_at: created, updated_at: updated});
    return profile;
}

function productProfile(id: number): ProductFeaturedProfile {
    const profile = new ProductFeaturedProfile();
    profile.produceFeaturedProfile();
    Object.assign(profile, {id, user, created_at: created, updated_at: updated});
    return profile;
}

describe('featured profile service', () => {
    beforeEach(() => jest.resetAllMocks());

    test('maps a registration profile to its DTO', async () => {
        mocked.getRegistrationFeaturedProfile.mockResolvedValue(registrationProfile(3));

        await expect(findRegistrationProfile(3)).resolves.toEqual({
            id: 3,
            user,
            created_at: created,
            updated_at: updated,
            registration_featured_profile_state: 'PENDING',
        });
    });

    test('maps lists of profiles to DTOs', async () => {
        mocked.getAllRegistrationFeaturedProfiles.mockResolvedValue([registrationProfile(1), registrationProfile(2)]);
        mocked.getAllProductFeaturedProfiles.mockResolvedValue([productProfile(5)]);

        const registrations = await listRegistrationProfiles();
        const products = await listProductProfiles();

        expect(registrations.map(p => p.id)).toEqual([1, 2]);
        expect(products[0]).toMatchObject({id: 5, product_featured_profile_state: 'OPEN'});
        expect(products[0].product_featured_profile_timestamp).toBeInstanceOf(Date);
    });

    test('creates a product profile for the given user and returns the DTO', async () => {
        mocked.createProductFeaturedProfile.mockResolvedValue(productProfile(8));

        const dto = await createProductProfile(1);

        expect(mocked.createProductFeaturedProfile).toHaveBeenCalledWith(1);
        expect(dto.id).toBe(8);
    });

    test('dashboard combines categories with both profile lists', async () => {
        const categories = [{id: 1, name: "Books", sorting: 0}];
        mocked.getCategories.mockResolvedValue(categories);
        mocked.getAllProductFeaturedProfiles.mockResolvedValue([productProfile(5)]);
        mocked.getAllRegistrationFeaturedProfiles.mockResolvedValue([registrationProfile(1)]);

        const dashboard = await getDashboard();

        expect(dashboard.categories).toEqual(categories);
        expect(dashboard.productFeaturedProfiles).toHaveLength(1);
        expect(dashboard.registrationFeaturedProfiles).toHaveLength(1);
        expect(dashboard.registrationFeaturedProfiles[0]).toHaveProperty('registration_featured_profile_state');
    });
});
