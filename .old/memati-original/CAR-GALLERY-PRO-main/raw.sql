
-- Insert the Classified
INSERT INTO classifieds (
    slug, 
    title, 
    description, 
    year, 
    odo_reading, 
    doors, 
    seats, 
    price, 
    make_id, 
    model_id, 
    colour, 
    "bodyType",        
    "fuelType",        
    transmission, 
    "odoUnit",         
    currency, 
    status,
    created_at,
    updated_at
) VALUES (
    'volkswagen-van-2020-' || EXTRACT(EPOCH FROM NOW())::text,
    '2020 Volkswagen Van',
    'A reliable 2020 Volkswagen van in excellent condition with low mileage',
    2020,
    45000, -- Odometer reading in miles
    4,     -- Number of doors
    7,     -- Number of seats (typical for a van)
    28000, -- Price in pence (£280.00)
    2,     -- make_id = 2 (Volkswagen)
    (SELECT id FROM models WHERE name = 'Van' AND make_id = 2),
    'YELLOW',
    'SUV',     -- Closest body type to van in your enum
    'DIESEL',  -- Typical fuel type for vans
    'MANUAL',
    'MILES',
    'GBP',
    'LIVE',
    NOW(),
    NOW()
);

-- Insert the images
INSERT INTO images (alt, src, classified_id, blurhash, is_main) VALUES
('2020 Volkswagen Van Image 1', 'https://meat-motors.imgix.net/car-2.jpeg', 
 (SELECT id FROM classifieds WHERE slug LIKE 'volkswagen-van-2020-%' ORDER BY created_at DESC LIMIT 1), 
 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH', true),
('2020 Volkswagen Van Image 2', 'https://meat-motors.imgix.net/car-1.jpeg', 
 (SELECT id FROM classifieds WHERE slug LIKE 'volkswagen-van-2020-%' ORDER BY created_at DESC LIMIT 1), 
 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH', false),
('2020 Volkswagen Van Image 3', 'https://meat-motors.imgix.net/car-3.jpg', 
 (SELECT id FROM classifieds WHERE slug LIKE 'volkswagen-van-2020-%' ORDER BY created_at DESC LIMIT 1), 
 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH', false),
('2020 Volkswagen Van Image 4', 'https://meat-motors.imgix.net/car-4.jpeg', 
 (SELECT id FROM classifieds WHERE slug LIKE 'volkswagen-van-2020-%' ORDER BY created_at DESC LIMIT 1), 
 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH', false),
('2020 Volkswagen Van Image 5', 'https://meat-motors.imgix.net/car-5.jpeg', 
 (SELECT id FROM classifieds WHERE slug LIKE 'volkswagen-van-2020-%' ORDER BY created_at DESC LIMIT 1), 
 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH', false);