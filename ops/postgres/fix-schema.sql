-- Идемпотентное выравнивание схемы под текущий EF-модель.
-- Безопасно на пустой БД (до Migrate): меняет только существующие таблицы.
\set ON_ERROR_STOP on

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_settings')
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'system_settings' AND column_name = 'key'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'system_settings' AND column_name = 'id'
     ) THEN
    ALTER TABLE system_settings RENAME COLUMN key TO id;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT true;
    ALTER TABLE users DROP COLUMN IF EXISTS status;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_hash text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expiration timestamp with time zone;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'time_logs')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'time_logs' AND column_name = 'user_id'
     ) THEN
    ALTER TABLE time_logs ADD COLUMN user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
    CREATE INDEX IF NOT EXISTS ix_time_logs_user_id ON time_logs (user_id);
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_time_logs_users_user_id') THEN
      ALTER TABLE time_logs
        ADD CONSTRAINT fk_time_logs_users_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE TABLE IF NOT EXISTS daily_reflections (
      id uuid NOT NULL,
      user_id uuid NOT NULL,
      date date NOT NULL,
      stress_level integer NOT NULL,
      value_level integer NOT NULL,
      CONSTRAINT pk_daily_reflections PRIMARY KEY (id),
      CONSTRAINT fk_daily_reflections_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS ix_daily_reflections_user_id ON daily_reflections (user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS render_jobs (
  id uuid NOT NULL,
  external_job_id text,
  status text DEFAULT 'Queued',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pk_render_jobs PRIMARY KEY (id)
);

COMMIT;
