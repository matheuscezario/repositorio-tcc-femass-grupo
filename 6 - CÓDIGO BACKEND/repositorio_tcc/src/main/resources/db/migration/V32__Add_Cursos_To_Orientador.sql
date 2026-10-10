
ALTER TABLE orientador
ADD COLUMN atua_em_todos_cursos BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE orientador_curso (
    orientador_id UUID NOT NULL,
    curso_id UUID NOT NULL,

    PRIMARY KEY (orientador_id, curso_id),

    CONSTRAINT fk_orientador_curso_orientador
        FOREIGN KEY (orientador_id)
        REFERENCES orientador(id),

    CONSTRAINT fk_orientador_curso_curso
        FOREIGN KEY (curso_id)
        REFERENCES curso(id)
);
