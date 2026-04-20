-- Add creator_name to dyai_sounds and dyai_prompts
alter table dyai_sounds add column if not exists creator_name text;
alter table dyai_prompts add column if not exists creator_name text;
