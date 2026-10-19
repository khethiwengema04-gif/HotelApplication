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

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    hotel_id FOREIGN KEY,
    room_type VARCHAR(255) NOT NULL,
    price_per_night INT,
    is_available BOOLEAN
)

CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night >= 0),
    total_rooms INTEGER NOT NULL DEFAULT 1 CHECK (total_rooms >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_available BOOLEAN
);

CREATE TABLE IF NOT EXISTS favourites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    hotel_id INTEGER NOT NULL
        REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_hotel
        UNIQUE (user_id, hotel_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user_id
    ON favourites(user_id);
