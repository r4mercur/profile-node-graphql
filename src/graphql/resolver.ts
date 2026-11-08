import {
    createUser,
    deleteUser,
    getCategories,
    getUser,
    getUsers,
    loginUser,
    updateUser
} from "../db/dataset";
import {
    createProductProfile,
    createRegistrationProfile,
    findProductProfile,
    findRegistrationProfile,
    listProductProfiles,
    listRegistrationProfiles
} from "../services/featured-profile-service";
import {FeaturedProfileDto} from "../feature/dto";
import jwt from "jsonwebtoken";

type NoParent = unknown;

// `FeaturedProfile` (id, user) is a subset of every featured profile DTO, so the DTO resolves it directly.
const featuredProfile = (profile: FeaturedProfileDto) => profile;

const Resolver = {
    Query: {
        getAllUsers: () => getUsers(),
        getUser: (_: NoParent, args: { id: number }) => getUser(args.id),
        getRegistrationFeaturedProfile: (_: NoParent, {id}: { id: number }) => findRegistrationProfile(id),
        getProductFeaturedProfile: (_: NoParent, {id}: { id: number }) => findProductProfile(id),
        getAllProductFeaturedProfiles: () => listProductProfiles(),
        getAllRegistrationFeaturedProfiles: () => listRegistrationProfiles(),
        getAllCategories: () => getCategories(),
    },
    Mutation: {
        createUser: (_: NoParent, args: { username: string, email: string, password: string }) => createUser(args),
        updateUser: (_: NoParent, args: {
            id: number,
            username: string,
            email: string,
            password: string
        }) => updateUser(args),
        deleteUser: (_: NoParent, args: { id: number }) => deleteUser(args.id),
        createRegistrationFeaturedProfile: (_: NoParent, {user_id}: { user_id: number }) => createRegistrationProfile(user_id),
        createProductFeaturedProfile: (_: NoParent, {user_id}: { user_id: number }) => createProductProfile(user_id),
        login: async (_: NoParent, args: { email: string, password: string }) => {
            const user = await loginUser({email: args.email, password: args.password});
            if (!user) {
                throw new Error('Invalid email or password');
            }

            const token = jwt.sign({user_id: user.id}, 'secret', {expiresIn: '1h'});

            return {
                user,
                token
            }
        },
    },
    RegistrationFeaturedProfile: {
        featured_profile: featuredProfile,
    },
    ProductFeaturedProfile: {
        featured_profile: featuredProfile,
    },
};

export default Resolver;
