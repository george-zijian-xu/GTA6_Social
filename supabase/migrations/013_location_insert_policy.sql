-- Allow authenticated users to insert new locations (auto-created from geocoding)
create policy "authenticated insert location"
  on locations for insert
  to authenticated
  with check (true);
