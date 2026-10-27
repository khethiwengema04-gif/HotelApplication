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
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE, 
    room_type VARCHAR(255) NOT NULL,
    price_per_night INT,
    is_available BOOLEAN
); 


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



CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    room_type_id INTEGER NOT NULL
        REFERENCES room_types(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    rooms_booked INTEGER NOT NULL DEFAULT 1
        CHECK (rooms_booked > 0),
    guest_count INTEGER NOT NULL
        CHECK (guest_count > 0),
    price_per_night NUMERIC(10, 2) NOT NULL
        CHECK (price_per_night >= 0),
    total_price NUMERIC(12, 2) NOT NULL
        CHECK (total_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK ( status IN ('Pending','Confirmed','Rejected','Cancelled','Completed')
        ),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_booking_dates
        CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id
    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates
    ON bookings(room_type_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings(status);



CREATE TABLE IF NOT EXISTS reviews (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
hotel_id INTEGER NOT NULL
   REFERENCES hotels(id) ON DELETE CASCADE,
rating INTEGER NOT NULL
   CHECK (rating >= 1 AND rating <= 5),
comment TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT unique_user_hotel_review UNIQUE (user_id, hotel_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_hotel_id
    ON reviews(hotel_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id
    ON reviews(user_id);


CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL
        REFERENCES bookings(id)
        ON DELETE RESTRICT,
    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
        CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    payment_method VARCHAR(50) DEFAULT 'Paystack',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Successful', 'Failed')),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_booking_id
    ON payments(booking_id);
CREATE INDEX idx_payments_user_id
    ON payments(user_id);
