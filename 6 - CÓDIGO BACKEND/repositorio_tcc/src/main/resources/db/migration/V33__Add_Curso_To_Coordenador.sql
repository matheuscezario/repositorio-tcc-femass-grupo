ALTER TABLE coordenador
ADD COLUMN IF NOT EXISTS id_curso UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'coordenador'::regclass
          AND contype = 'f'
          AND confrelid = 'curso'::regclass
    ) THEN
        ALTER TABLE coordenador
        ADD CONSTRAINT coordenador_id_curso_fkey
        FOREIGN KEY (id_curso)
        REFERENCES curso(id);
    END IF;
END $$;

ALTER TABLE coordenador
ALTER COLUMN id_curso SET NOT NULL;