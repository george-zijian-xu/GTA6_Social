-- Add address column and migrate data from description
ALTER TABLE locations ADD COLUMN address TEXT;

-- Move existing description data to address
UPDATE locations SET address = description WHERE description IS NOT NULL;

-- Clear description (will be populated properly on next import)
UPDATE locations SET description = NULL;
