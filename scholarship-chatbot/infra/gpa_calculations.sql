-- GPA Calculations Table
CREATE TABLE IF NOT EXISTS gpa_calculations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    
    -- Calculation metadata
    calculation_type VARCHAR(20), -- 'sgpa' or 'cgpa'
    semester_name TEXT, -- e.g., "Fall 2023", "Semester 5"
    grading_scale VARCHAR(20), -- '10-point', '4-point', 'percentage'
    
    -- Calculation data
    courses JSONB, -- Array of {name, credits, grade, gradePoints}
    total_credits NUMERIC(6,2),
    total_grade_points NUMERIC(8,2),
    gpa NUMERIC(4,2),
    
    -- For CGPA calculations
    previous_cgpa NUMERIC(4,2),
    previous_credits NUMERIC(6,2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gpa_calculations_user_id ON gpa_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_gpa_calculations_created_at ON gpa_calculations(created_at DESC);
