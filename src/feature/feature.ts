interface FeaturedProfileBuilder {
    produceFeaturedProfile(): void;
}

class FeaturedProfile {
    private userId!: string;
    private name!: string;
    private age!: number;
}

class RegistrationFeaturedProfile extends FeaturedProfile implements FeaturedProfileBuilder {
    private featuredProfile: RegistrationFeaturedProfile;

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