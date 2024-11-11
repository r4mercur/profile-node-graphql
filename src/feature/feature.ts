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

    public registrationFeaturedProfileState!: RegistrationFeaturedProfileState;

    constructor() {
        super();
        this.featuredProfile = this;
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
    }
}

export class ProductFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: ProductFeaturedProfile;

    public productFeaturedProfileState!: ProductFeaturedProfileState;
    public productFeaturedProfileTimestamp!: Date;

    constructor() {
        super();
        this.featuredProfile = this;
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
    }
}