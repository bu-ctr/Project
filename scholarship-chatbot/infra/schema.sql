-- ==========================
-- DATABASE SCHEMA FOR SCHOLARSHIP CHATBOT
-- PostgreSQL Version
-- ==========================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    auth_provider VARCHAR(20) DEFAULT 'email',
    google_id VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    full_name TEXT,
    dob DATE,
    country TEXT,
    college TEXT,
    course TEXT,
    year_of_study INT,
    gpa NUMERIC(4,2),
    income NUMERIC,

    -- NEW FIELDS ADDED
    caste TEXT,
    disability BOOLEAN DEFAULT FALSE,
    disability_details TEXT,

    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,

    tenth_marks NUMERIC(5,2),
    tenth_percentage NUMERIC(5,2),

    twelfth_marks NUMERIC(6,2),
    twelfth_percentage NUMERIC(5,2),

    last_semester_marks NUMERIC(5,2),

    updated_at TIMESTAMP DEFAULT NOW()
);

-- SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT,
    description TEXT,
    amount TEXT,
    deadline DATE,
    application_url TEXT,

    -- steps extracted by AI or manually entered
    process_steps JSONB,

    -- matching rules
    criteria JSONB,

    tags TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    scholarship_id INT REFERENCES scholarships(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    scholarship_id INT,
    type VARCHAR(50),
    payload JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS internships (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT,
    stipend TEXT,
    deadline DATE,
    application_url TEXT,
    process_steps JSONB,
    criteria JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    organizer TEXT,
    description TEXT,
    prize_money TEXT,
    event_date TEXT,
    application_url TEXT,
    process_steps JSONB,
    criteria JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
