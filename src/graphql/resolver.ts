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
        createRegistrationFeaturedProfile: (_: User, args: {
            id: number
        }) => createRegistrationFeaturedProfile(args.id),
        createProductFeaturedProfile: (_: User, args: { id: number }) => createProductFeaturedProfile(args.id),
    }
};

export default Resolver;