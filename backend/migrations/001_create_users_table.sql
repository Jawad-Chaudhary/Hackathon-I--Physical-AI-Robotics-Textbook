-- Migration: Create users table
-- Database: Neon Postgres
-- Date: 2025-12-03

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    python_knowledge BOOLEAN DEFAULT FALSE,
    has_nvidia_gpu BOOLEAN DEFAULT FALSE,
    experience_level VARCHAR(50) DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles with hardware and software background for personalization';
COMMENT ON COLUMN users.python_knowledge IS 'Whether user knows Python (for personalized analogies)';
COMMENT ON COLUMN users.has_nvidia_gpu IS 'Whether user has NVIDIA GPU (for GPU-related content)';
COMMENT ON COLUMN users.experience_level IS 'User experience level: beginner, intermediate, or advanced';
