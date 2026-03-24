-- Add nullable title column to posts (backward compatible)
alter table posts add column title text;
