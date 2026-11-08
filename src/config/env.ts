/**
 * Runtime configuration. Every value can be overridden with an environment variable;
 * the defaults match the local docker-compose setup.
 */
const env = process.env;

const rabbit = {
    host: env.RABBIT_HOST ?? 'localhost',
    port: Number(env.RABBIT_PORT ?? 5672),
    user: env.RABBIT_USER ?? 'rabbit',
    password: env.RABBIT_PASSWORD ?? 'password',
};

export const config = {
    port: Number(env.PORT ?? 4000),
    db: {
        host: env.DB_HOST ?? 'localhost',
        port: Number(env.DB_PORT ?? 5432),
        user: env.DB_USER ?? 'postgres',
        password: env.DB_PASSWORD ?? 'password',
        database: env.DB_NAME ?? 'postgres',
    },
    rabbit: {
        ...rabbit,
        uri: `amqp://${rabbit.user}:${rabbit.password}@${rabbit.host}:${rabbit.port}`,
    },
};
