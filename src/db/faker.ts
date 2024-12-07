import {faker} from '@faker-js/faker';
import {createProductFeaturedProfile, createRegistrationFeaturedProfile, createUser} from "./dataset";
import {FakeUser} from "../types";

export async function createFakerUser(): Promise<FakeUser> {
    const fake_user: FakeUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password()
    };

    const created_user = await createUser(fake_user);
    fake_user.id = created_user.id;
    return fake_user;
}


async function createFakerProductFeaturedProfile(fake_user: FakeUser) {
    if (fake_user.id) {
        await createProductFeaturedProfile(fake_user.id).then(r =>
            console.log("Created ProductFeaturedProfile", r));
        return;
    }

    throw new Error("User ID is not defined, could not create ProductFeaturedProfile");
}

async function createFakerRegistrationFeaturedProfile(fake_user: FakeUser) {
    if (fake_user.id) {
        await createRegistrationFeaturedProfile(fake_user.id).then(r =>
            console.log("Created RegistrationFeaturedProfile", r));
        return;
    }

    throw new Error("User ID is not defined, could not create RegistrationFeaturedProfile");
}

async function createFakerData() {
    const fake_users = await Promise.all(Array.from({length: 50}, createFakerUser));

    for (let index = 0; index < fake_users.length; index++) {
        const user: FakeUser = fake_users[index];

        if (index % 4 < 2) {
            await createFakerRegistrationFeaturedProfile(user);
        } else {
            await createFakerProductFeaturedProfile(user);
        }
    }
}

createFakerData().then(r => console.log("Created Faker Data"));