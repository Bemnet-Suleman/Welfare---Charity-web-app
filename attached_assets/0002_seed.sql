-- Seed data for the Welfare charity database

-- Insert sample users
INSERT INTO users (username, password, email, full_name, role, avatar, verified, created_at) VALUES
('redcross', '$2b$10$hashedpassword1', 'contact@redcross.et', 'Red Cross Ethiopia', 'organizer', 'https://api.dicebear.com/7.x/initials/svg?seed=RC', true, NOW()),
('waterlife', '$2b$10$hashedpassword2', 'info@waterlife.org', 'Water for Life', 'organizer', 'https://api.dicebear.com/7.x/initials/svg?seed=WL', true, NOW()),
('educationfirst', '$2b$10$hashedpassword3', 'contact@educationfirst.et', 'Education First', 'organizer', 'https://api.dicebear.com/7.x/initials/svg?seed=EF', true, NOW()),
('john_donor', '$2b$10$hashedpassword4', 'john@example.com', 'John Smith', 'donor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', false, NOW()),
('sarah_volunteer', '$2b$10$hashedpassword5', 'sarah@example.com', 'Sarah Johnson', 'donor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', false, NOW());

-- Insert sample campaigns
INSERT INTO campaigns (title, description, image, category, goal_amount, raised_amount, organizer_id, start_date, end_date, status, urgent, location, created_at) VALUES
('Emergency Relief: Flood Victims in Southern Ethiopia', 'Provide immediate aid including food, water, shelter, and medical supplies to families affected by devastating floods.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', 'Disaster Relief', 100000.00, 67000.00, (SELECT id FROM users WHERE username = 'redcross'), NOW(), NOW() + INTERVAL '30 days', 'active', true, 'Southern Ethiopia', NOW()),
('Clean Water Wells for Rural Communities', 'Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.', 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80', 'Healthcare', 75000.00, 52000.00, (SELECT id FROM users WHERE username = 'waterlife'), NOW(), NOW() + INTERVAL '45 days', 'active', false, 'Rural Ethiopia', NOW()),
('School Supplies for 500 Students', 'Equip underprivileged children with essential school supplies, textbooks, and learning materials for the academic year.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', 'Education', 25000.00, 18500.00, (SELECT id FROM users WHERE username = 'educationfirst'), NOW(), NOW() + INTERVAL '60 days', 'active', false, 'Addis Ababa', NOW()),
('Medical Equipment for Rural Clinics', 'Provide essential medical equipment and supplies to 15 rural health clinics serving over 50,000 people.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80', 'Healthcare', 150000.00, 89000.00, (SELECT id FROM users WHERE username = 'redcross'), NOW(), NOW() + INTERVAL '90 days', 'active', false, 'Various Regions', NOW()),
('Emergency Food Distribution', 'Distribute emergency food packages to families affected by drought in northern regions.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', 'Disaster Relief', 50000.00, 35000.00, (SELECT id FROM users WHERE username = 'redcross'), NOW(), NOW() + INTERVAL '20 days', 'active', true, 'Northern Ethiopia', NOW());

-- Insert sample donations
INSERT INTO donations (campaign_id, donor_id, amount, anonymous, message, payment_method, transaction_id, created_at) VALUES
((SELECT id FROM campaigns WHERE title LIKE '%Flood Victims%'), (SELECT id FROM users WHERE username = 'john_donor'), 500.00, false, 'Hope this helps the families in need.', 'credit_card', 'txn_1234567890', NOW() - INTERVAL '5 days'),
((SELECT id FROM campaigns WHERE title LIKE '%Flood Victims%'), NULL, 1000.00, true, NULL, 'paypal', 'txn_1234567891', NOW() - INTERVAL '3 days'),
((SELECT id FROM campaigns WHERE title LIKE '%Water Wells%'), (SELECT id FROM users WHERE username = 'sarah_volunteer'), 250.00, false, 'Clean water is so important!', 'credit_card', 'txn_1234567892', NOW() - INTERVAL '7 days'),
((SELECT id FROM campaigns WHERE title LIKE '%School Supplies%'), (SELECT id FROM users WHERE username = 'john_donor'), 150.00, false, 'Education is the key to a better future.', 'bank_transfer', 'txn_1234567893', NOW() - INTERVAL '10 days'),
((SELECT id FROM campaigns WHERE title LIKE '%Medical Equipment%'), NULL, 2000.00, true, NULL, 'credit_card', 'txn_1234567894', NOW() - INTERVAL '2 days');

-- Insert sample stories
INSERT INTO stories (title, content, image, author_id, campaign_id, published, created_at) VALUES
('A Life Saved', 'The medical supplies donated through Welfare saved my son''s life. When the hospital ran out of critical medications, these generous donors stepped in. I will be forever grateful.', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80', (SELECT id FROM users WHERE username = 'john_donor'), (SELECT id FROM campaigns WHERE title LIKE '%Flood Victims%'), true, NOW() - INTERVAL '7 days'),
('Volunteering Changed My Life', 'Volunteering with Welfare has been the most rewarding experience of my life. Seeing children smile when they receive their school supplies reminds me why I do this.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80', (SELECT id FROM users WHERE username = 'sarah_volunteer'), (SELECT id FROM campaigns WHERE title LIKE '%School Supplies%'), true, NOW() - INTERVAL '12 days'),
('Transparency Restores Faith', 'As a donor, I appreciate the transparency. I can see exactly where my money goes and the real impact it makes. This platform has restored my faith in charitable giving.', 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80', (SELECT id FROM users WHERE username = 'john_donor'), (SELECT id FROM campaigns WHERE title LIKE '%Water Wells%'), true, NOW() - INTERVAL '15 days'),
('From Crisis to Hope', 'After losing everything in the floods, the emergency relief provided by Welfare gave our family hope for the future. We are rebuilding our lives thanks to generous donors.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', (SELECT id FROM users WHERE username = 'sarah_volunteer'), (SELECT id FROM campaigns WHERE title LIKE '%Flood Victims%'), true, NOW() - INTERVAL '20 days');

-- Insert sample volunteers
INSERT INTO volunteers (user_id, campaign_id, skills, availability, experience, status, created_at) VALUES
((SELECT id FROM users WHERE username = 'sarah_volunteer'), (SELECT id FROM campaigns WHERE title LIKE '%School Supplies%'), '["teaching", "organization", "logistics"]', 'weekends', '5 years in education volunteering', 'approved', NOW() - INTERVAL '14 days'),
((SELECT id FROM users WHERE username = 'john_donor'), (SELECT id FROM campaigns WHERE title LIKE '%Water Wells%'), '["engineering", "construction", "project management"]', 'full-time', '10 years in water infrastructure', 'approved', NOW() - INTERVAL '10 days'),
((SELECT id FROM users WHERE username = 'sarah_volunteer'), (SELECT id FROM campaigns WHERE title LIKE '%Medical Equipment%'), '["medical", "logistics", "coordination"]', 'part-time', '3 years in healthcare volunteering', 'pending', NOW() - INTERVAL '5 days');