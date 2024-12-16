import pool from "./db";
import bcrypt from "bcrypt";
import {Category, FakeUser, User} from "../types";
import {FeaturedProfileType, ProductFeaturedProfile, RegistrationFeaturedProfile} from "../feature/feature";

export async function getUsers(): Promise<User[]> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>(`SELECT id, username, email, created_at, updated_at
                                              FROM "user"`);
        return res.rows;
    } finally {
        client.release();
    }
}

export async function getUser(id: number): Promise<User> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>(`SELECT *
                                              FROM "user"
                                              WHERE id = $1`, [id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function createUser({ username, email, password }: { username: string, email: string, password: string }): Promise<User> {
    const client = await pool.connect();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const res = await client.query<User>(`INSERT INTO "user" (username, email, password, created_at, updated_at)
                                              VALUES ($1, $2, $3, now(), now())
                                              RETURNING *`, [username, email, hashedPassword]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function createUserWithFakeUser(fake_user: FakeUser): Promise<User> {
    const client = await pool.connect();
    const hashedPassword = await bcrypt.hash(fake_user.password, 10);

    try {
        const res = await client.query<User>(`INSERT INTO "user" (username, email, password, avatar_url, created_at, updated_at)
                                              VALUES ($1, $2, $3, $4, now(), now())
                                              RETURNING *`, [fake_user.username, fake_user.email, hashedPassword, fake_user.avatar_url]);
        return res.rows[0];
    } finally {
        client.release();
    }
}


export async function loginUser({ email, password }: { email: string, password: string }): Promise<User | null> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>(`SELECT * FROM "user" WHERE email = $1`, [email]);
        const user = res.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        } else {
            return null;
        }
    } finally {
        client.release();
    }
}

export async function updateUser({id, username, email, password}: {
    id: number,
    username: string,
    email: string,
    password: string
}): Promise<User> {
    const client = await pool.connect();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const res = await client.query<User>(`UPDATE "user"
                                              SET username   = $1,
                                                  email      = $2,
                                                  password   = $3,
                                                  updated_at = now()
                                              WHERE id = $4
                                              RETURNING *`, [username, email, hashedPassword, id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function deleteUser(id: number): Promise<User> {
    const client = await pool.connect();
    try {
        const res = await client.query<User>(`DELETE
                                              FROM "user"
                                              WHERE id = $1
                                              RETURNING *`, [id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getRegistrationFeaturedProfile(id: number): Promise<RegistrationFeaturedProfile> {
    const client = await pool.connect();
    try {
        const res = await client.query(
            `SELECT *
             FROM featured_profile
             WHERE id = $1
               AND featured_profile_type = $2`,
            [id, FeaturedProfileType.REGISTRATION]
        );

        if (res.rows.length === 0) {
            throw new Error(`RegistrationFeaturedProfile with id ${id} not found`);
        }

        const row = res.rows[0];
        const profile = new RegistrationFeaturedProfile();
        const user = await getUser(row.user_id);

        profile.id = row.id;
        profile.registrationFeaturedProfileState = row.registration_featured_profile_state;
        profile.user = user;
        profile.created_at = row.created_at;
        profile.updated_at = row.updated_at;


        return profile;
    } finally {
        client.release();
    }
}

export async function createRegistrationFeaturedProfile(userId: number): Promise<RegistrationFeaturedProfile> {
    const client = await pool.connect();
    try {
        const profile = new RegistrationFeaturedProfile();
        profile.produceFeaturedProfile();

        const res = await client.query(
            `INSERT INTO featured_profile (user_id, featured_profile_type, registration_featured_profile_state,
                                           created_at, updated_at)
             VALUES ($1, $2, $3, now(), now())
             RETURNING *`,
            [
                userId,
                FeaturedProfileType.REGISTRATION,
                profile.registrationFeaturedProfileState
            ]
        );

        const row = res.rows[0];
        const user = await getUser(userId);

        profile.id = row.id;
        profile.registrationFeaturedProfileState = row.registration_featured_profile_state;
        profile.user = user;
        profile.created_at = row.created_at;
        profile.updated_at = row.updated_at;
        return profile;
    } finally {
        client.release();
    }
}

export async function getProductFeaturedProfile(id: number): Promise<ProductFeaturedProfile> {
    const client = await pool.connect();
    try {
        const res = await client.query(
            `SELECT *
             FROM featured_profile
             WHERE id = $1
               AND featured_profile_type = $2`,
            [id, FeaturedProfileType.PRODUCT]
        );

        if (res.rows.length === 0) {
            throw new Error(`ProductFeaturedProfile with id ${id} not found`);
        }

        const row = res.rows[0];
        const profile = new ProductFeaturedProfile();
        const user = await getUser(row.user_id);

        profile.id = row.id;
        profile.productFeaturedProfileState = row.product_featured_profile_state;
        profile.productFeaturedProfileTimestamp = row.product_featured_profile_timestamp;
        profile.user = user;

        return profile;
    } finally {
        client.release();
    }
}

export async function getAllProductFeaturedProfiles(): Promise<ProductFeaturedProfile[]> {
    const client = await pool.connect();
    try {
        const res = await client.query(
            `SELECT *
             FROM featured_profile
             WHERE featured_profile_type = $1`,
            [FeaturedProfileType.PRODUCT]
        );


        const profiles: ProductFeaturedProfile[] = [];
        for (const row of res.rows) {
            const profile = new ProductFeaturedProfile();
            profile.id = row.id;
            profile.productFeaturedProfileState = row.product_featured_profile_state;
            profile.productFeaturedProfileTimestamp = row.product_featured_profile_timestamp;
            profile.user = await getUser(row.user_id);
            profile.created_at = row.created_at;
            profile.updated_at = row.updated_at;

            profiles.push(profile);
        }

        return profiles;
    } finally {
        client.release();
    }
}

export async function getAllRegistrationFeaturedProfiles(): Promise<RegistrationFeaturedProfile[]> {
    const client = await pool.connect();

    try {
        const res = await client.query(
            `SELECT *
             FROM featured_profile
             WHERE featured_profile_type = $1`,
            [FeaturedProfileType.REGISTRATION]
        );

        const profiles: RegistrationFeaturedProfile[] = [];
        for (const row of res.rows) {
            const profile = new RegistrationFeaturedProfile();
            profile.id = row.id;
            profile.registrationFeaturedProfileState = row.registration_featured_profile_state;
            profile.user = await getUser(row.user_id);
            profile.created_at = row.created_at;
            profile.updated_at = row.updated_at;

            profiles.push(profile);
        }

        return profiles;
    } finally {
        client.release();
    }
}

export async function createProductFeaturedProfile(userId: number): Promise<ProductFeaturedProfile> {
    const client = await pool.connect();
    try {
        const profile = new ProductFeaturedProfile();
        profile.produceFeaturedProfile();

        const res = await client.query(
            `INSERT INTO featured_profile (user_id, featured_profile_type, product_featured_profile_state,
                                           product_featured_profile_timestamp, created_at, updated_at)
             VALUES ($1, $2, $3, $4, now(), now())
             RETURNING *`,
            [
                userId,
                FeaturedProfileType.PRODUCT,
                profile.productFeaturedProfileState,
                profile.productFeaturedProfileTimestamp
            ]
        );

        const createdProfile = res.rows[0];
        const user = await getUser(userId);

        profile.id = createdProfile.id;
        profile.user = user;
        profile.updated_at = createdProfile.updated_at;
        profile.created_at = createdProfile.created_at;

        return profile;
    } finally {
        client.release();
    }
}

export async function createCategory(category: Category): Promise<Category> {
    const client = await pool.connect();
    try {
        const res = await client.query<Category>(`INSERT INTO category (name, sorting, created_at, updated_at)
                                                  VALUES ($1, $2, now(), now())
                                                  RETURNING *`, [category.name, category.sorting]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getCategories(): Promise<Category[]> {
    const client = await pool.connect();
    try {
        const res = await client.query<Category>(`SELECT *
                                                  FROM category
                                                  ORDER BY sorting`);
        return res.rows;
    } finally {
        client.release();
    }
}

export async function updateUserAvatar(userId: number, avatarUrl: string): Promise<User> {
    const client = await pool.connect();
    try {
        const res = await client.query<User>(`UPDATE "user"
                                              SET avatar_url = $1, updated_at = now()
                                              WHERE id = $2
                                              RETURNING *`, [avatarUrl, userId]);
        return res.rows[0];
    } finally {
        client.release();
    }
}