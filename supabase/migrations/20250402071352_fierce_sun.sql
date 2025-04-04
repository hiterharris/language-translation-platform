/*
  # Insert Mock Data for Translation Platform

  1. Data Population
    - Sample users
    - Document examples across different types (PDF, DOCX, MP3, MP4)
    - Translation records with various statuses
    - Language pairs
    - LLM provider configurations

  2. Test Data Categories
    - Text documents (reports, briefs, letters)
    - Audio recordings (interviews, broadcasts)
    - Video content (news clips, training materials)
    - Images with text (documents, signs)
*/

-- Insert additional languages
INSERT INTO languages (code, name) VALUES
  ('english', 'English'),
  ('russian', 'Russian'),
  ('chinese', 'Chinese (Mandarin)'),
  ('arabic', 'Arabic')
ON CONFLICT (code) DO NOTHING;

-- Insert additional LLM providers
INSERT INTO llm_providers (name, api_endpoint, config) VALUES
  ('Azure OpenAI', 'https://api.azure.com/openai/deployments', '{"model": "gpt-4", "version": "2024-02"}'),
  ('Anthropic Claude', 'https://api.anthropic.com/v1', '{"model": "claude-3-opus"}'),
  ('Google Gemini', 'https://api.google.com/v1/models', '{"model": "gemini-pro"}')
ON CONFLICT DO NOTHING;

-- Insert sample documents
INSERT INTO documents (
  id,
  user_id,
  title,
  file_path,
  file_type,
  source_language,
  target_language,
  status,
  metadata,
  created_at
) VALUES
  -- Text Documents
  (
    'doc_001',
    'user_001',
    'Field Report 117-C',
    'documents/field_report_117c.pdf',
    'application/pdf',
    (SELECT id FROM languages WHERE code = 'dari'),
    (SELECT id FROM languages WHERE code = 'english'),
    'completed',
    '{"pages": 5, "word_count": 2500, "priority": "high"}',
    '2025-03-28T10:00:00Z'
  ),
  (
    'doc_002',
    'user_001',
    'Intelligence Brief 23',
    'documents/intel_brief_23.docx',
    'application/docx',
    (SELECT id FROM languages WHERE code = 'dari'),
    (SELECT id FROM languages WHERE code = 'english'),
    'in_progress',
    '{"pages": 3, "word_count": 1500, "priority": "urgent"}',
    '2025-03-30T14:30:00Z'
  ),
  -- Audio Documents
  (
    'doc_003',
    'user_002',
    'Interview Recording',
    'audio/interview_rec_001.mp3',
    'audio/mpeg',
    (SELECT id FROM languages WHERE code = 'pashto'),
    (SELECT id FROM languages WHERE code = 'english'),
    'pending',
    '{"duration": "45:30", "speakers": 2, "quality": "high"}',
    '2025-03-29T09:15:00Z'
  ),
  -- Video Documents
  (
    'doc_004',
    'user_002',
    'Training Video Segment',
    'video/training_001.mp4',
    'video/mp4',
    (SELECT id FROM languages WHERE code = 'dari'),
    (SELECT id FROM languages WHERE code = 'english'),
    'pending',
    '{"duration": "15:45", "resolution": "1080p", "has_subtitles": true}',
    '2025-03-31T11:20:00Z'
  );

-- Insert sample translations
INSERT INTO translations (
  id,
  document_id,
  llm_provider_id,
  content,
  status,
  metadata,
  created_at,
  updated_at
) VALUES
  (
    'trans_001',
    'doc_001',
    (SELECT id FROM llm_providers WHERE name = 'OpenAI'),
    'Sample translated content for Field Report 117-C...',
    'completed',
    '{"confidence_score": 0.95, "review_status": "approved"}',
    '2025-03-28T10:30:00Z',
    '2025-03-28T11:45:00Z'
  ),
  (
    'trans_002',
    'doc_002',
    (SELECT id FROM llm_providers WHERE name = 'OpenAI'),
    'Partial translation of Intelligence Brief 23...',
    'in_progress',
    '{"confidence_score": 0.88, "completion_percentage": 65}',
    '2025-03-30T14:35:00Z',
    '2025-03-30T15:20:00Z'
  ),
  (
    'trans_003',
    'doc_003',
    (SELECT id FROM llm_providers WHERE name = 'OpenAI'),
    NULL,
    'pending',
    '{"estimated_duration": "45:30"}',
    '2025-03-29T09:20:00Z',
    '2025-03-29T09:20:00Z'
  );