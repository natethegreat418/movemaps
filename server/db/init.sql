-- Initialize PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Filming locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- movie or tv
  coordinates GEOMETRY(Point, 4326) NOT NULL,
  trailer_url VARCHAR(255),
  imdb_link VARCHAR(255)
);

-- Submissions table for moderation
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  coordinates GEOMETRY(Point, 4326) NOT NULL,
  trailer_url VARCHAR(255),
  imdb_link VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' -- pending, approved, rejected
);

-- Moderators table
CREATE TABLE IF NOT EXISTS moderators (
  uid VARCHAR(255) PRIMARY KEY
);