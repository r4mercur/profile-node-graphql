CREATE TABLE IF NOT EXISTS "user"
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "featured_profile"
(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    featured_profile_type               VARCHAR(255),
    registration_featured_profile_state varchar(255),
    product_featured_profile_state      varchar(255),
    product_featured_profile_timestamp  TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id)
);

CREATE TABLE IF NOT EXISTS "category" (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    sorting    INT          NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP    NOT NULL
);