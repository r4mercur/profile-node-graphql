import {ProductFeaturedProfile, RegistrationFeaturedProfile} from "../feature/feature";

/**
 * The part of a message exchange the publisher needs; `RabbitExchange` satisfies it.
 */
export interface EventExchange {
    publish(routingKey: string, message: string): Promise<void>;
}

/**
 * Publishes domain events for featured profiles. The exchanges are injected, so the
 * domain classes themselves know nothing about RabbitMQ.
 */
export class FeaturedProfileEventPublisher {
    constructor(
        private readonly registrationExchange: EventExchange,
        private readonly productExchange: EventExchange,
    ) {}

    publishRegistrationCreated(profile: RegistrationFeaturedProfile): Promise<void> {
        console.log('Registration featured profile created');
        return this.registrationExchange.publish('registration', JSON.stringify({
            id: profile.id,
            user: profile.user,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            registrationFeaturedProfileState: profile.registrationFeaturedProfileState,
        }));
    }

    publishProductCreated(profile: ProductFeaturedProfile): Promise<void> {
        console.log('Product featured profile created');
        return this.productExchange.publish('product', JSON.stringify({
            id: profile.id,
            user: profile.user,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            productFeaturedProfileState: profile.productFeaturedProfileState,
            productFeaturedProfileTimestamp: profile.productFeaturedProfileTimestamp,
        }));
    }
}
