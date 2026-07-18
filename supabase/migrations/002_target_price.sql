-- Add target_price column to products table
ALTER TABLE products ADD COLUMN target_price NUMERIC DEFAULT NULL;
