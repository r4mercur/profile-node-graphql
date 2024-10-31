import {ProductFeaturedProfile, RegistrationFeaturedProfile} from "../feature";

describe('FeaturedProfile Builder Pattern', () => {
    let registrationProfile: RegistrationFeaturedProfile;
    let productProfile: ProductFeaturedProfile;

    beforeEach(() => {
        registrationProfile = new RegistrationFeaturedProfile();
        productProfile = new ProductFeaturedProfile();
    });

    test('should create a new RegistrationFeaturedProfile and reset it', () => {
        registrationProfile.produceFeaturedProfile();
        expect(registrationProfile).toBeInstanceOf(RegistrationFeaturedProfile);

        registrationProfile.reset();
        expect(registrationProfile).toBeInstanceOf(RegistrationFeaturedProfile);
    });

    test('should create a new ProductFeaturedProfile and reset it', () => {
        productProfile.produceFeaturedProfile();
        expect(productProfile).toBeInstanceOf(ProductFeaturedProfile);

        productProfile.reset();
        expect(productProfile).toBeInstanceOf(ProductFeaturedProfile);
    });
});