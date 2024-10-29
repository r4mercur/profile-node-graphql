import pool from "./db";
import { User } from "./types";

export async function getUsers(): Promise<User[]> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>("SELECT * FROM users");
        return res.rows;
    } finally {
        client.release();
    }
}

export async function getUser(id: number): Promise<User> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>("SELECT * FROM users WHERE id = $1", [id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function createUser({ username, email, password }: { username: string, email: string, password: string }): Promise<User> {
    const client = await pool.connect();

    try {
        const res = await client.query<User>("INSERT INTO users (username, email, password, created_at, updated_at) VALUES ($1, $2, $3, now(), now()) RETURNING *", [username, email, password]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function updateUser(user: User): Promise<User> {
    const client = await pool.connect();
    try {
        const res = await client.query<User>("UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *", [user.username, user.email, user.password, user.id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function deleteUser(id: number): Promise<User> {
    const client = await pool.connect();
    try {
        const res = await client.query<User>("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        return res.rows[0];
    } finally {
        client.release();
    }
}