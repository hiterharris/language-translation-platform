/*
  # Initial Schema Setup for Translation Platform

  1. New Tables
    - `users`
      - Stores user information and preferences
    - `documents`
      - Stores uploaded document metadata
    - `translations`
      - Stores translation results and status
    - `languages`
      - Supported languages catalog
    - `llm_providers`
      - Available LLM providers and configurations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Languages are viewable by all users"
  ON languages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create llm_providers table
CREATE TABLE IF NOT EXISTS llm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  api_endpoint text NOT NULL,
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "LLM providers are viewable by all users"
  ON llm_providers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  source_language uuid REFERENCES languages,
  target_language uuid REFERENCES languages,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents NOT NULL,
  llm_provider_id uuid REFERENCES llm_providers,
  content text,
  status text DEFAULT 'pending',
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view translations of their documents"
  ON translations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = translations.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Insert initial supported languages
INSERT INTO languages (code, name) VALUES
  ('dari', 'Dari'),
  ('pashto', 'Pashto'),
  ('uzbek', 'Uzbek'),
  ('tajik', 'Tajik')
ON CONFLICT (code) DO NOTHING;

-- Insert initial LLM provider
INSERT INTO llm_providers (name, api_endpoint) VALUES
  ('OpenAI', 'https://api.openai.com/v1')
ON CONFLICT DO NOTHING;