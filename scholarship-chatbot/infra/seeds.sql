-- ==========================
-- SEED DATA
-- ==========================

-- USERS
INSERT INTO users (email, password_hash, is_admin)
VALUES 
    ('admin@example.com', '12345678', true),
    ('alice@example.com', ''),
    ('bob@example.com', '');

-- PROFILES
INSERT INTO profiles (
    user_id, full_name, course, year_of_study, gpa, income,
    caste, disability, disability_details,
    address_line1, city, state, postal_code, country,
    tenth_percentage, twelfth_percentage, last_semester_marks
)
VALUES
    (2, 'Alice Student', 'Computer Science', 2, 8.6, 200000,
        'General', false, null,
        '123 Road', 'Mumbai', 'Maharashtra', '400001', 'India',
        88, 90, 85),

    (3, 'Bob Learner', 'Mechanical Engineering', 3, 7.4, 600000,
        'OBC', false, null,
        '44 Street', 'Pune', 'Maharashtra', '411001', 'India',
        75, 78, 72);

-- SAMPLE SCHOLARSHIPS
INSERT INTO scholarships (title, provider, description, amount, deadline, application_url, process_steps, criteria)
VALUES
(
    'CS Excellence Scholarship',
    'TechTrust',
    'For Computer Science students with good GPA and low income.',
    '₹50,000',
    '2026-01-31',
    'https://example.com/apply-cs',
    '[]',
    '{
        "gpa_min": 8.0,
        "course_in": ["Computer Science"],
        "max_income": 500000,
        "min_10_percentage": 75,
        "min_12_percentage": 80
    }'
),
(
    'ST/SC Merit Scholarship',
    'Govt. Education Board',
    'Scholarship for ST/SC category students with 12th marks above 70%',
    '₹35,000',
    '2026-03-15',
    'https://example.com/stsc-scholarship',
    '[]',
    '{
        "caste_in": ["SC", "ST"],
        "min_12_percentage": 70
    }'
),
(
    'Disability Support Scholarship',
    'Inclusive India Foundation',
    'Financial support for students with documented disabilities.',
    '₹40,000',
    '2026-02-20',
    'https://example.com/disability-grant',
    '[]',
    '{
        "disability_required": true
    }'
);
