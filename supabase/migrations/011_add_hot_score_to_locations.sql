-- Add hot_score column to locations table
alter table locations add column hot_score numeric not null default 0;

-- Create index for sorting by hot_score
create index idx_locations_hot_score on locations(hot_score desc);
