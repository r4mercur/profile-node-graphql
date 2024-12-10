import {faker} from '@faker-js/faker';
import {createCategory, createProductFeaturedProfile, createRegistrationFeaturedProfile, createUser} from "./dataset";
import {Category, FakeUser} from "../types";

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

async function createFakeCategories() {

    for (let index = 0; index < 5; index++) {
        const category: Category = {
            name: faker.commerce.department(),
            sorting: index
        }

        await createCategory(category).then(r => console.log("Created Category", r));
    }
}

async function createFakerData() {
    await createFakeCategories();
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

createFakerData().then(() => console.log("Created Faker Data"));