-- Add address field to locations table
alter table locations add column if not exists address text;
