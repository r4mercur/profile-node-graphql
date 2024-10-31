interface FeaturedProfileBuilder {
    produceFeaturedProfile(): void;
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


class RegistrationFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: RegistrationFeaturedProfile;

    private registrationFeaturedProfileState!: RegistrationFeaturedProfileState; 

    constructor() {
        super();
        this.featuredProfile = new RegistrationFeaturedProfile();
    }

    public reset(): void {
        this.featuredProfile = new RegistrationFeaturedProfile();
    }

    /**
     * All production steps work with the same for featured profiles.
     */
    produceFeaturedProfile(): void {}
}

class ProductFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: ProductFeaturedProfile;

    private productFeaturedProfileState!: ProductFeaturedProfileState;

    constructor() {
        super();
        this.featuredProfile = new ProductFeaturedProfile();
    }

    public reset(): void {
        this.featuredProfile = new ProductFeaturedProfile();
    }

    /**
     * All production steps work with the same for featured profiles.
     */
    produceFeaturedProfile(): void {}
}