
-- Indica se o professor atua em todos os cursos
ALTER TABLE professor_tcc
ADD COLUMN atua_em_todos_cursos BOOLEAN NOT NULL DEFAULT FALSE;

-- Relacionamento entre professores e cursos
CREATE TABLE professor_tcc_curso (
    professor_id UUID NOT NULL,
    curso_id UUID NOT NULL,

    PRIMARY KEY (professor_id, curso_id),

    CONSTRAINT fk_professor_tcc_curso_professor
        FOREIGN KEY (professor_id)
        REFERENCES professor_tcc(id),

    CONSTRAINT fk_professor_tcc_curso_curso
        FOREIGN KEY (curso_id)
        REFERENCES curso(id)
);
