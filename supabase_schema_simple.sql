-- CommuniTrack Database Schema (Simplified Version)
-- This version avoids operations that require superuser privileges

-- Enable UUID extension (should work in most Supabase instances)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, color) VALUES
  ('Konflikt', '#ef4444'),
  ('Gespräch', '#3b82f6'),
  ('Verhalten', '#f59e0b'),
  ('Beweis', '#10b981'),
  ('Kindbetreuung', '#8b5cf6'),
  ('Sonstiges', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  is_important BOOLEAN DEFAULT FALSE,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- RLS Policies for entries
DROP POLICY IF EXISTS "Users can view their own entries" ON entries;
CREATE POLICY "Users can view their own entries" ON entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own entries" ON entries;
CREATE POLICY "Users can insert their own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own entries" ON entries;
CREATE POLICY "Users can update their own entries" ON entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own entries" ON entries;
CREATE POLICY "Users can delete their own entries" ON entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for attachments
DROP POLICY IF EXISTS "Users can view attachments of their entries" ON attachments;
CREATE POLICY "Users can view attachments of their entries" ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = attachments.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert attachments to their entries" ON attachments;
CREATE POLICY "Users can insert attachments to their entries" ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = attachments.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update attachments of their entries" ON attachments;
CREATE POLICY "Users can update attachments of their entries" ON attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = attachments.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete attachments of their entries" ON attachments;
CREATE POLICY "Users can delete attachments of their entries" ON attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM entries 
      WHERE entries.id = attachments.entry_id 
      AND entries.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for entries table
DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at 
    BEFORE UPDATE ON entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Note: Storage bucket and policies need to be created manually in Supabase Dashboard
-- Go to Storage > Create bucket named "attachments" (set to Private)
