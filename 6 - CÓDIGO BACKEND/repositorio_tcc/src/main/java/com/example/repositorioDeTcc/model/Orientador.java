
package com.example.repositorioDeTcc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@Entity
@Table(name = "orientador")
public class Orientador extends Pessoa {

    private String cpf;

    @Column(name = "atua_em_todos_cursos", nullable = false)
    private boolean atuaEmTodosCursos = false;

    @ManyToMany
    @JoinTable(
        name = "orientador_curso",
        joinColumns = @JoinColumn(name = "orientador_id"),
        inverseJoinColumns = @JoinColumn(name = "curso_id")
    )
    private Set<Curso> cursos = new HashSet<>();

    public Orientador(
            String nomeCompleto,
            String telefone,
            String email,
            String cpf
    ) {
        super(nomeCompleto, telefone, email);
        this.cpf = cpf;
    }
}
