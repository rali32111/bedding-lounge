/*
  # Seed Sample Data

  1. Sample Products
    - Add variety of bedding products
    - Include different categories and price ranges
    - Add product images and details

  2. Sample Reviews
    - Add customer reviews for products
    - Include ratings and comments
*/

-- Insert sample products
INSERT INTO products (name, description, price, category, stock_quantity, image_urls, sku, weight, dimensions, care_instructions, rating, review_count) VALUES
('Luxury Egyptian Cotton Sheets', 'Ultra-soft 1000 thread count Egyptian cotton sheets for the perfect night''s sleep. Made from the finest long-staple cotton fibers.', 299.99, 'bedsheets', 25, 
 ARRAY['https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'ECS-1000-W', 2.5, 'Queen: 60" x 80"', 'Machine wash cold, tumble dry low', 4.8, 156),

('Premium Duvet Cover Set', 'Soft and breathable duvet cover set with matching pillowcases. Made from premium cotton blend for ultimate comfort.', 199.99, 'duvet-covers', 18, 
 ARRAY['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'DCS-PRE-G', 1.8, 'Queen: 90" x 90"', 'Machine wash warm, tumble dry low', 4.7, 98),

('Memory Foam Pillows', 'Ergonomic memory foam pillows for optimal neck and head support. Contours to your unique shape for personalized comfort.', 79.99, 'pillows', 42, 
 ARRAY['https://images.pexels.com/photos/1034806/pexels-photo-1034806.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'MFP-ERG-2', 3.2, 'Standard: 20" x 26"', 'Spot clean only', 4.9, 234),

('Bamboo Fiber Bed Sheets', 'Eco-friendly bamboo fiber sheets that are naturally antibacterial and moisture-wicking. Perfect for sensitive skin.', 149.99, 'bedsheets', 31, 
 ARRAY['https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'BFS-ECO-B', 2.1, 'Queen: 60" x 80"', 'Machine wash cold, line dry', 4.6, 87),

('Silk Pillowcase Set', 'Luxurious mulberry silk pillowcases for hair and skin care. Reduces friction and helps prevent bedhead and wrinkles.', 89.99, 'pillows', 15, 
 ARRAY['https://images.pexels.com/photos/1034806/pexels-photo-1034806.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'SPC-MUL-S', 0.3, 'Standard: 20" x 30"', 'Hand wash cold, air dry', 4.8, 145),

('Percale Cotton Duvet Cover', 'Crisp and breathable percale cotton duvet cover for hot sleepers. Lightweight and cooling for year-round comfort.', 159.99, 'duvet-covers', 22, 
 ARRAY['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'PCD-COT-W', 1.5, 'Queen: 90" x 90"', 'Machine wash cold, tumble dry low', 4.5, 76),

('Microfiber Sheet Set', 'Affordable and comfortable microfiber sheet set. Wrinkle-resistant and easy to care for, perfect for everyday use.', 49.99, 'bedsheets', 58, 
 ARRAY['https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'MFS-ECO-B', 1.8, 'Queen: 60" x 80"', 'Machine wash warm, tumble dry low', 4.3, 203),

('Down Alternative Comforter', 'Hypoallergenic down alternative comforter with medium warmth. Perfect for all seasons and allergy sufferers.', 119.99, 'duvet-covers', 28, 
 ARRAY['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'DAC-MED-W', 4.2, 'Queen: 88" x 92"', 'Machine wash cold, tumble dry low', 4.4, 167),

('Cooling Gel Pillow', 'Innovative cooling gel pillow that regulates temperature throughout the night. Memory foam core with cooling gel layer.', 69.99, 'pillows', 35, 
 ARRAY['https://images.pexels.com/photos/1034806/pexels-photo-1034806.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'CGP-MEM-C', 2.8, 'Standard: 20" x 26"', 'Spot clean cover, air dry', 4.6, 89),

('Linen Duvet Cover', 'Natural linen duvet cover with a relaxed, lived-in feel. Stonewashed for softness and pre-shrunk for durability.', 179.99, 'duvet-covers', 19, 
 ARRAY['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'LDC-NAT-G', 2.1, 'Queen: 90" x 90"', 'Machine wash cold, tumble dry low', 4.7, 124),

('Organic Cotton Sheets', 'GOTS-certified organic cotton sheets that are soft, breathable, and environmentally friendly. No harmful chemicals.', 189.99, 'bedsheets', 24, 
 ARRAY['https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'OCS-GOT-W', 2.3, 'Queen: 60" x 80"', 'Machine wash cold, tumble dry low', 4.8, 93),

('Adjustable Foam Pillow', 'Customizable foam pillow with removable layers to adjust height and firmness. Perfect for all sleep positions.', 59.99, 'pillows', 47, 
 ARRAY['https://images.pexels.com/photos/1034806/pexels-photo-1034806.jpeg?auto=compress&cs=tinysrgb&w=600'], 
 'AFP-ADJ-S', 2.1, 'Standard: 20" x 26"', 'Remove cover and machine wash', 4.5, 178);

-- Note: Sample customer and review data would be added here in a real application
-- For now, we'll let the frontend create these through user interactions