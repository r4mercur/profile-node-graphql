import {
    createProductFeaturedProfile,
    createRegistrationFeaturedProfile,
    createUser,
    deleteUser,
    getAllProductFeaturedProfiles,
    getProductFeaturedProfile,
    getRegistrationFeaturedProfile,
    getUser,
    getUsers,
    updateUser
} from "../db/dataset";
import {User} from "../types";

const Resolver = {
    Query: {
        getAllUsers: () => getUsers(),
        getUser: (_: User, args: { id: number }) => getUser(args.id),
        getRegistrationFeaturedProfile: async (_: any, {id}: { id: number }) => {
            const profile = await getRegistrationFeaturedProfile(id);
            return {
                id: profile.id,
                featured_profile: profile,
                registration_featured_profile_state: profile.registrationFeaturedProfileState,
                user: profile.user,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            };
        },
        getProductFeaturedProfile: async (_: any, {id}: { id: number }) => {
            const profile = await getProductFeaturedProfile(id);
            return {
                id: profile.id,
                featured_profile: profile,
                product_featured_profile_state: profile.productFeaturedProfileState,
                product_featured_profile_timestamp: profile.productFeaturedProfileTimestamp,
                user: profile.user,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            };
        },
        getAllProductFeaturedProfiles: async () => {
            const profiles = await getAllProductFeaturedProfiles();
            return profiles.map(profile => {
                return {
                    id: profile.id,
                    featured_profile: profile,
                    product_featured_profile_state: profile.productFeaturedProfileState,
                    product_featured_profile_timestamp: profile.productFeaturedProfileTimestamp,
                    user: profile.user,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at,
                };
            });
        },
        getAllRegistrationFeaturedProfiles: async () => {
        },
    },
    Mutation: {
        createUser: (_: User, args: { username: string, email: string, password: string }) => createUser(args),
        updateUser: (_: User, args: {
            id: number,
            username: string,
            email: string,
            password: string
        }) => updateUser(args),
        deleteUser: (_: User, args: { id: number }) => deleteUser(args.id),
        createRegistrationFeaturedProfile: async (_: any, {user_id}: { user_id: number }) => {
            const profile = await createRegistrationFeaturedProfile(user_id);
            return {
                id: profile.id,
                featured_profile: profile,
                registration_featured_profile_state: profile.registrationFeaturedProfileState,
                user: profile.user,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            };
        },
        createProductFeaturedProfile: async (_: any, {user_id}: { user_id: number }) => {
            const profile = await createProductFeaturedProfile(user_id);
            return {
                id: profile.id,
                featured_profile: profile,
                product_featured_profile_state: profile.productFeaturedProfileState,
                product_featured_profile_timestamp: profile.productFeaturedProfileTimestamp,
                user: profile.user,
                created_at: profile.created_at,
                updated_at: profile.updated_at,
            };
        },
    }
};

export default Resolver;