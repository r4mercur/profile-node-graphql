import { RabbitExchange } from "../rabbit/exchange";
import {User} from "../types";

interface FeaturedProfileBuilder {
    produceFeaturedProfile(): void;
    produceEvent(): void;
    reset(): void;
}

class FeaturedProfile {
    public id!: number;
    public user!: User;
    public created_at!: Date;
    public updated_at!: Date;
}

export enum FeaturedProfileType {
    REGISTRATION = 'RegistrationFeaturedProfile',
    PRODUCT = 'ProductFeaturedProfile',
}

export enum RegistrationFeaturedProfileState {
    PENDING = 'PENDING',
    SKIPPED = 'SKIPPED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DELETED = 'DELETED',
}

export enum ProductFeaturedProfileState {
    OPEN = 'OPEN',
    INTERACTED = 'INTERACTED',
    CLOSED = 'CLOSED',
    REJECTED = 'REJECTED',
    DELETED = 'DELETED',
}


export class RegistrationFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: RegistrationFeaturedProfile;
    private eventHandler: RabbitExchange;

    public registrationFeaturedProfileState!: RegistrationFeaturedProfileState;

    constructor() {
        super();
        this.featuredProfile = this;
        this.eventHandler = new RabbitExchange("amqp://rabbit:password@localhost:5672", "registrationEvents");
    }

    public reset(): void {
        this.featuredProfile = this;
    }

    /**
     * All production steps work with the same for featured profiles.
     */
    produceFeaturedProfile(): void {
        this.featuredProfile = this;
        this.featuredProfile.registrationFeaturedProfileState = RegistrationFeaturedProfileState.PENDING;
    }

    public produceEvent(): void {
        console.log('Registration featured profile created');
        this.eventHandler.publish('registration', JSON.stringify(this.serialize()));
    }

    private serialize(): object {
        return {
            id: this.id,
            user: this.user,
            created_at: this.created_at,
            updated_at: this.updated_at,
            registrationFeaturedProfileState: this.registrationFeaturedProfileState
        };
    }
}

export class ProductFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: ProductFeaturedProfile;
    private eventHandler: RabbitExchange;

    public productFeaturedProfileState!: ProductFeaturedProfileState;
    public productFeaturedProfileTimestamp!: Date;

    constructor() {
        super();
        this.featuredProfile = this;
        this.eventHandler = new RabbitExchange("amqp://rabbit:password@localhost:5672", "productEvents");
    }

    public reset(): void {
        this.featuredProfile = this;
    }

    /**
     * All production steps work with the same for featured profiles.
     */
    produceFeaturedProfile(): void {
        this.featuredProfile = this;
        this.featuredProfile.productFeaturedProfileState = ProductFeaturedProfileState.OPEN;
        this.featuredProfile.productFeaturedProfileTimestamp = new Date();
    }

    public produceEvent(): void {
        console.log('Product featured profile created');
        this.eventHandler.publish('product', JSON.stringify(this.serialize()));
    }

    private serialize(): object {
        return {
            id: this.id,
            user: this.user,
            created_at: this.created_at,
            updated_at: this.updated_at,
            productFeaturedProfileState: this.productFeaturedProfileState,
            productFeaturedProfileTimestamp: this.productFeaturedProfileTimestamp
        };
    }
}