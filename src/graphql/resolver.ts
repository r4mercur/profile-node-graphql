import {
    createProductFeaturedProfile,
    createRegistrationFeaturedProfile,
    createUser,
    deleteUser,
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
        getRegistrationFeaturedProfile: (_: User, args: { id: number }) => getRegistrationFeaturedProfile(args.id),
        getProductFeaturedProfile: (_: User, args: { id: number }) => getProductFeaturedProfile(args.id),
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
        createRegistrationFeaturedProfile: (_: any, args: {
            user_id: number
        }) => createRegistrationFeaturedProfile(args.user_id),
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