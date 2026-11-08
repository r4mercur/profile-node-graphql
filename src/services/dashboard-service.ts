import {getCategories} from "../db/dataset";
import {Category} from "../types";
import {ProductFeaturedProfileDto, RegistrationFeaturedProfileDto} from "../feature/dto";
import {listProductProfiles, listRegistrationProfiles} from "./featured-profile-service";

export interface Dashboard {
    categories: Category[];
    productFeaturedProfiles: ProductFeaturedProfileDto[];
    registrationFeaturedProfiles: RegistrationFeaturedProfileDto[];
}

export async function getDashboard(): Promise<Dashboard> {
    const [categories, productFeaturedProfiles, registrationFeaturedProfiles] = await Promise.all([
        getCategories(),
        listProductProfiles(),
        listRegistrationProfiles(),
    ]);

    return {categories, productFeaturedProfiles, registrationFeaturedProfiles};
}
