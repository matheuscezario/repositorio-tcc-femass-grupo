
-- Relacionamento entre professores e turmas
CREATE TABLE professor_tcc_turma (
    professor_id UUID NOT NULL,
    turma_id UUID NOT NULL,

    PRIMARY KEY (professor_id, turma_id),

    CONSTRAINT fk_professor_tcc_turma_professor
        FOREIGN KEY (professor_id)
        REFERENCES professor_tcc(id),

    CONSTRAINT fk_professor_tcc_turma_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id)
);
