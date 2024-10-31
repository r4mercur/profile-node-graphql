interface FeaturedProfileBuilder {
    produceFeaturedProfile(): void;

    reset(): void;
}

class FeaturedProfile {
    private userId!: string;
    private name!: string;
    private age!: number;
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

    private registrationFeaturedProfileState!: RegistrationFeaturedProfileState; 

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
    produceFeaturedProfile(): void {}
}

export class ProductFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: ProductFeaturedProfile;

    private productFeaturedProfileState!: ProductFeaturedProfileState;
    private productFeaturedProfileTimestamp!: Date;

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
    produceFeaturedProfile(): void {}
}