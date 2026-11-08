import {FeaturedProfileEventPublisher} from "../featured-profile-publisher";
import {ProductFeaturedProfile, RegistrationFeaturedProfile} from "../../feature/feature";

describe('FeaturedProfileEventPublisher', () => {
    const registrationExchange = {publish: jest.fn().mockResolvedValue(undefined)};
    const productExchange = {publish: jest.fn().mockResolvedValue(undefined)};
    const publisher = new FeaturedProfileEventPublisher(registrationExchange, productExchange);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should publish a registration event on the registration exchange', async () => {
        const profile = new RegistrationFeaturedProfile();
        profile.produceFeaturedProfile();
        profile.id = 7;

        await publisher.publishRegistrationCreated(profile);

        expect(console.log).toHaveBeenCalledWith('Registration featured profile created');
        expect(registrationExchange.publish).toHaveBeenCalledWith('registration', expect.any(String));
        expect(productExchange.publish).not.toHaveBeenCalled();

        const payload = JSON.parse(registrationExchange.publish.mock.calls[0][1]);
        expect(payload).toMatchObject({id: 7, registrationFeaturedProfileState: 'PENDING'});
    });

    test('should publish a product event on the product exchange', async () => {
        const profile = new ProductFeaturedProfile();
        profile.produceFeaturedProfile();
        profile.id = 9;

        await publisher.publishProductCreated(profile);

        expect(console.log).toHaveBeenCalledWith('Product featured profile created');
        expect(productExchange.publish).toHaveBeenCalledWith('product', expect.any(String));
        expect(registrationExchange.publish).not.toHaveBeenCalled();

        const payload = JSON.parse(productExchange.publish.mock.calls[0][1]);
        expect(payload).toMatchObject({id: 9, productFeaturedProfileState: 'OPEN'});
    });

    test('should propagate publish errors to the caller', async () => {
        registrationExchange.publish.mockRejectedValueOnce(new Error('Channel not established'));

        await expect(publisher.publishRegistrationCreated(new RegistrationFeaturedProfile()))
            .rejects.toThrow('Channel not established');
    });
});
