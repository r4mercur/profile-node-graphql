import pool from "./db";
import {User} from "../types";
import {FeaturedProfileType, ProductFeaturedProfile, RegistrationFeaturedProfile} from "../feature/feature";

export async function getUsers(): Promise<User[]> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>(`SELECT *
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

    try {
        const res = await client.query<User>(`INSERT INTO "user" (username, email, password, created_at, updated_at)
                                              VALUES ($1, $2, $3, now(), now())
                                              RETURNING *`, [username, email, password]);
        return res.rows[0];
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
    try {
        const res = await client.query<User>(`UPDATE "user"
                                              SET username   = $1,
                                                  email      = $2,
                                                  password   = $3,
                                                  updated_at = now()
                                              WHERE id = $4
                                              RETURNING *`, [username, email, password, id]);
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