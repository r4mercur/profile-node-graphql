import {User} from "../types";

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

export abstract class FeaturedProfile {
    public id!: number;
    public user!: User;
    public created_at!: Date;
    public updated_at!: Date;

    /**
     * Sets the initial state of a freshly created featured profile.
     */
    abstract produceFeaturedProfile(): void;
}

export class RegistrationFeaturedProfile extends FeaturedProfile {
    public registrationFeaturedProfileState!: RegistrationFeaturedProfileState;

    produceFeaturedProfile(): void {
        this.registrationFeaturedProfileState = RegistrationFeaturedProfileState.PENDING;
    }
}

export class ProductFeaturedProfile extends FeaturedProfile {
    public productFeaturedProfileState!: ProductFeaturedProfileState;
    public productFeaturedProfileTimestamp!: Date;

    produceFeaturedProfile(): void {
        this.productFeaturedProfileState = ProductFeaturedProfileState.OPEN;
        this.productFeaturedProfileTimestamp = new Date();
    }
}
