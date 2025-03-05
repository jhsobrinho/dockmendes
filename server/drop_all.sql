-- Desabilita temporariamente as restrições de chave estrangeira
SET session_replication_role = 'replica';

-- Drop todas as tabelas
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
  END LOOP;
END $$;

-- Drop todos os tipos customizados (enums)
DO $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT t.typname
    FROM pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    AND t.typtype = 'e'
  )
  LOOP
    EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
  END LOOP;
END $$;

-- Reabilita as restrições de chave estrangeira
SET session_replication_role = 'origin';
