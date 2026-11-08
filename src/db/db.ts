import {Pool, PoolClient} from 'pg';
import {config} from '../config/env';

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
});

/**
 * Runs `fn` with a pooled client and always releases the client afterwards.
 */
export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();

    try {
        return await fn(client);
    } finally {
        client.release();
    }
}

export default pool;
