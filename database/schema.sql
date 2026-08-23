
-- Roads
CREATE TABLE roads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    road_type VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspections
CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    road_id INTEGER REFERENCES roads(id) ON DELETE SET NULL,
    image_path TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Defects detected by AI
CREATE TABLE defects (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER REFERENCES inspections(id) ON DELETE CASCADE,
    defect_type VARCHAR(100) NOT NULL,
    confidence NUMERIC(5,4),
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    priority_score INTEGER CHECK (priority_score BETWEEN 0 AND 100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'detected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repair records
CREATE TABLE repair_records (
    id SERIAL PRIMARY KEY,
    defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
    assigned_to VARCHAR(255),
    status VARCHAR(50) DEFAULT 'assigned',
    notes TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);