import {getUsers, getUser, createUser, deleteUser, updateUser} from "./dataset";
import {User} from "./types";

const Resolver = {
    Query: {
        getAllUsers: () => getUsers(),
        getUser: (_: User, args: { id: number }) => getUser(args.id),
    },
    Mutation: {
        createUser: (_: User, args: { username: string, email: string, password: string }) => createUser(args),
        updateUser: (_: User, args: { user: User }) => updateUser(args.user),
        deleteUser: (_: User, args: { id: number }) => deleteUser(args.id)
    }
};

export default Resolver;