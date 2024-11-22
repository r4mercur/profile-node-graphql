import {faker} from '@faker-js/faker';
import {createUser} from "./dataset";
import {FakeUser} from "../types";

export function createFakerUser() {
    const fake_user: FakeUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password()
    };

    createUser(fake_user).then(r => console.log(r));
}

faker.helpers.multiple(createFakerUser, {count: 10});