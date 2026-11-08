import {
    ProductFeaturedProfile,
    ProductFeaturedProfileState,
    RegistrationFeaturedProfile,
    RegistrationFeaturedProfileState
} from "../feature";

describe('FeaturedProfile initial state', () => {
    test('should create a RegistrationFeaturedProfile in state PENDING', () => {
        const profile = new RegistrationFeaturedProfile();
        profile.produceFeaturedProfile();

        expect(profile.registrationFeaturedProfileState).toBe(RegistrationFeaturedProfileState.PENDING);
    });

    test('should create a ProductFeaturedProfile in state OPEN with a timestamp', () => {
        const profile = new ProductFeaturedProfile();
        profile.produceFeaturedProfile();

        expect(profile.productFeaturedProfileState).toBe(ProductFeaturedProfileState.OPEN);
        expect(profile.productFeaturedProfileTimestamp).toBeInstanceOf(Date);
    });
});
