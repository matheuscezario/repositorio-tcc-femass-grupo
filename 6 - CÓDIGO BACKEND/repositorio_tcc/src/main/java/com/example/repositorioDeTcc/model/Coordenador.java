
package com.example.repositorioDeTcc.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Table(name = "coordenador")
@Entity
public class Coordenador extends Pessoa {

    private String cpf;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    public Coordenador(
            String nomeCompleto,
            String telefone,
            String email,
            String cpf
    ) {
        super(nomeCompleto, telefone, email);
        this.cpf = cpf;
    }
}
