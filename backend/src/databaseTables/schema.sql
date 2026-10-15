CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'User'
);

CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    facilities TEXT[],
    policies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(10, 2) NOT NULL,
    images TEXT[],
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5)

);
