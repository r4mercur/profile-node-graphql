import {
    createProductFeaturedProfile,
    createRegistrationFeaturedProfile,
    getAllProductFeaturedProfiles,
    getAllRegistrationFeaturedProfiles,
    getProductFeaturedProfile,
    getRegistrationFeaturedProfile
} from "../db/dataset";
import {
    ProductFeaturedProfileDto,
    RegistrationFeaturedProfileDto,
    toProductFeaturedProfileDto,
    toRegistrationFeaturedProfileDto
} from "../feature/dto";

/**
 * Use cases around featured profiles. Both the GraphQL resolvers and the REST endpoints go through here.
 */

export async function findRegistrationProfile(id: number): Promise<RegistrationFeaturedProfileDto> {
    return toRegistrationFeaturedProfileDto(await getRegistrationFeaturedProfile(id));
}

export async function listRegistrationProfiles(): Promise<RegistrationFeaturedProfileDto[]> {
    return (await getAllRegistrationFeaturedProfiles()).map(toRegistrationFeaturedProfileDto);
}

export async function createRegistrationProfile(userId: number): Promise<RegistrationFeaturedProfileDto> {
    return toRegistrationFeaturedProfileDto(await createRegistrationFeaturedProfile(userId));
}

export async function findProductProfile(id: number): Promise<ProductFeaturedProfileDto> {
    return toProductFeaturedProfileDto(await getProductFeaturedProfile(id));
}

export async function listProductProfiles(): Promise<ProductFeaturedProfileDto[]> {
    return (await getAllProductFeaturedProfiles()).map(toProductFeaturedProfileDto);
}

export async function createProductProfile(userId: number): Promise<ProductFeaturedProfileDto> {
    return toProductFeaturedProfileDto(await createProductFeaturedProfile(userId));
}
