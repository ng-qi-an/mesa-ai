CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_chunks (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    file_id text NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    token_count integer NOT NULL DEFAULT 0,
    embedding vector(1536) NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    date_created timestamp NOT NULL DEFAULT now(),
    date_modified timestamp NOT NULL DEFAULT now(),
    CONSTRAINT rag_chunks_file_chunk_unique UNIQUE(file_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS rag_index_jobs (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    file_id text NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending',
    attempts integer NOT NULL DEFAULT 0,
    error text,
    content_hash text,
    started_at timestamp,
    finished_at timestamp,
    date_created timestamp NOT NULL DEFAULT now(),
    date_modified timestamp NOT NULL DEFAULT now(),
    CONSTRAINT rag_index_jobs_file_unique UNIQUE(file_id)
);

CREATE INDEX IF NOT EXISTS rag_chunks_user_idx ON rag_chunks(user_id);
CREATE INDEX IF NOT EXISTS rag_chunks_class_idx ON rag_chunks(class_id);
CREATE INDEX IF NOT EXISTS rag_chunks_file_idx ON rag_chunks(file_id);
CREATE INDEX IF NOT EXISTS rag_index_jobs_status_idx ON rag_index_jobs(status);
CREATE INDEX IF NOT EXISTS rag_index_jobs_user_idx ON rag_index_jobs(user_id);

CREATE INDEX IF NOT EXISTS rag_chunks_embedding_cos_idx ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
