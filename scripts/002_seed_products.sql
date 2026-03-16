-- Seed products with sample data
INSERT INTO products (name, description, price_in_cents, category, image_url, stock, featured) VALUES
-- Electronics
('Wireless Headphones Pro', 'Premium noise-canceling wireless headphones with 40-hour battery life and studio-quality sound.', 24999, 'electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 50, true),
('Smart Watch Series X', 'Advanced fitness tracking, heart monitoring, and seamless smartphone integration.', 39999, 'electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 30, true),
('Portable Bluetooth Speaker', 'Waterproof speaker with 360-degree sound and 20-hour playtime.', 8999, 'electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 100, false),
('Wireless Charging Pad', 'Fast wireless charging for all Qi-enabled devices with LED indicator.', 3499, 'electronics', 'https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=800&q=80', 200, false),

-- Clothing
('Classic Cotton T-Shirt', 'Premium 100% organic cotton t-shirt with a comfortable relaxed fit.', 2999, 'clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 150, true),
('Denim Jacket', 'Timeless denim jacket with a modern slim fit and vintage wash.', 8999, 'clothing', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', 40, true),
('Running Sneakers', 'Lightweight running shoes with responsive cushioning and breathable mesh.', 12999, 'clothing', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 75, false),
('Wool Blend Beanie', 'Soft wool blend beanie perfect for cold weather.', 1999, 'clothing', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80', 200, false),

-- Home & Living
('Minimalist Desk Lamp', 'Adjustable LED desk lamp with touch controls and USB charging port.', 5999, 'home', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', 60, true),
('Ceramic Plant Pot Set', 'Set of 3 modern ceramic pots in varying sizes with drainage holes.', 4499, 'home', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80', 80, false),
('Bamboo Cutting Board', 'Eco-friendly bamboo cutting board with juice groove and easy-grip handles.', 3499, 'home', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80', 120, false),
('Scented Candle Collection', 'Set of 4 hand-poured soy candles with natural essential oils.', 4999, 'home', 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80', 90, true),

-- Accessories
('Leather Wallet', 'Genuine leather bifold wallet with RFID blocking technology.', 5999, 'accessories', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', 100, false),
('Canvas Backpack', 'Durable canvas backpack with laptop compartment and water-resistant coating.', 7999, 'accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 45, true),
('Sunglasses Classic', 'UV400 protected polarized sunglasses with titanium frame.', 14999, 'accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', 60, false),
('Stainless Steel Water Bottle', 'Double-walled insulated bottle keeps drinks cold for 24 hours.', 2499, 'accessories', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 180, false)
ON CONFLICT DO NOTHING;
