CREATE TABLE coordenador (
    id UUID PRIMARY KEY,
    cpf VARCHAR(255),
    CONSTRAINT fk_coordenador_pessoa
        FOREIGN KEY (id) REFERENCES pessoa(id)
);