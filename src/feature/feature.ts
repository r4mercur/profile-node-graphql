import {User} from "../types";

interface FeaturedProfileBuilder {
    produceFeaturedProfile(): void;
    reset(): void;
}

class FeaturedProfile {
    private user!: User;
    private createdAt!: Date;
    private updatedAt!: Date;
}

export enum FeaturedProfileType {
    REGISTRATION = 'RegistrationFeaturedProfile',
    PRODUCT = 'ProductFeaturedProfile',
}

enum RegistrationFeaturedProfileState {
    PENDING = 'pending',
    SKIPPED = 'skipped',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DELETED = 'deleted',
}

enum ProductFeaturedProfileState {
    OPEN = 'open',
    INTERACTED = 'interacted',
    CLOSED = 'closed',
    REJECTED = 'rejected',
    DELETED = 'deleted',
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
}