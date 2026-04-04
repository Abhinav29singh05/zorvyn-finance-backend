-- Seed an admin user (password: admin123 — bcrypt hashed)
INSERT INTO users (name, email, password, role, status) VALUES
('Admin User', 'admin@finance.com', '$2b$10$mvxBvyjTEJAnEQzYmUdFkeOuyCuRe7cmqgYvZ5sAsBSFEaOZ6xfIC', 'admin', 'active'),
('Jane Analyst', 'analyst@finance.com', '$2b$10$mvxBvyjTEJAnEQzYmUdFkeOuyCuRe7cmqgYvZ5sAsBSFEaOZ6xfIC', 'analyst', 'active'),
('John Viewer', 'viewer@finance.com', '$2b$10$mvxBvyjTEJAnEQzYmUdFkeOuyCuRe7cmqgYvZ5sAsBSFEaOZ6xfIC', 'viewer', 'active');

-- Seed financial records using the admin user
-- We use a subquery to get admin's UUID dynamically
INSERT INTO financial_records (user_id, amount, type, category, date, description) VALUES
((SELECT id FROM users WHERE email = 'admin@finance.com'), 5000.00, 'income', 'salary', '2025-01-15', 'Monthly salary'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 1200.00, 'expense', 'rent', '2025-01-01', 'Office rent'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 300.00, 'expense', 'utilities', '2025-01-05', 'Electricity and internet'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 2000.00, 'income', 'freelance', '2025-01-20', 'Client project payment'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 150.00, 'expense', 'food', '2025-01-10', 'Team lunch'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 5000.00, 'income', 'salary', '2025-02-15', 'Monthly salary'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 1200.00, 'expense', 'rent', '2025-02-01', 'Office rent'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 800.00, 'expense', 'software', '2025-02-10', 'Annual subscription renewals'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 3500.00, 'income', 'freelance', '2025-03-05', 'Consulting work'),
((SELECT id FROM users WHERE email = 'admin@finance.com'), 450.00, 'expense', 'travel', '2025-03-12', 'Client visit travel');
