import {User} from "../types";
import {
    ProductFeaturedProfile,
    ProductFeaturedProfileState,
    RegistrationFeaturedProfile,
    RegistrationFeaturedProfileState
} from "./feature";

/**
 * The API representation of a featured profile. GraphQL and REST both serve exactly these shapes
 * (snake_case, see README), so there is a single place that defines what leaves the application.
 */
export interface FeaturedProfileDto {
    id: number;
    user: User;
    created_at: Date;
    updated_at: Date;
}

export interface RegistrationFeaturedProfileDto extends FeaturedProfileDto {
    registration_featured_profile_state: RegistrationFeaturedProfileState;
}

export interface ProductFeaturedProfileDto extends FeaturedProfileDto {
    product_featured_profile_state: ProductFeaturedProfileState;
    product_featured_profile_timestamp: Date;
}

export function toRegistrationFeaturedProfileDto(profile: RegistrationFeaturedProfile): RegistrationFeaturedProfileDto {
    return {
        id: profile.id,
        user: profile.user,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        registration_featured_profile_state: profile.registrationFeaturedProfileState,
    };
}

export function toProductFeaturedProfileDto(profile: ProductFeaturedProfile): ProductFeaturedProfileDto {
    return {
        id: profile.id,
        user: profile.user,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        product_featured_profile_state: profile.productFeaturedProfileState,
        product_featured_profile_timestamp: profile.productFeaturedProfileTimestamp,
    };
}
