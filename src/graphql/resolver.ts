import {createUser, deleteUser, getUser, getUsers, updateUser} from "../db/dataset";
import {User} from "../types";

const Resolver = {
    Query: {
        getAllUsers: () => getUsers(),
        getUser: (_: User, args: { id: number }) => getUser(args.id),
    },
    Mutation: {
        createUser: (_: User, args: { username: string, email: string, password: string }) => createUser(args),
        updateUser: (_: User, args: {
            id: number,
            username: string,
            email: string,
            password: string
        }) => updateUser(args),
        deleteUser: (_: User, args: { id: number }) => deleteUser(args.id)
    }
};

export default Resolver;