ALTER TABLE posts
  ADD COLUMN post_type TEXT NOT NULL DEFAULT 'RR'
  CHECK (post_type IN ('GG','GR','RG','RR','NON_CANON'));
