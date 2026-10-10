
package com.example.repositorioDeTcc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@Table(name = "professor_tcc")
@Entity
public class ProfessorTCC extends Pessoa {

    private String cpf;

    @Column(name = "atua_em_todos_cursos", nullable = false)
    private boolean atuaEmTodosCursos = false;

    @ManyToMany
    @JoinTable(
        name = "professor_tcc_curso",
        joinColumns = @JoinColumn(name = "professor_id"),
        inverseJoinColumns = @JoinColumn(name = "curso_id")
    )
    private Set<Curso> cursos = new HashSet<>();

    public ProfessorTCC(
            String nomeCompleto,
            String telefone,
            String email,
            String cpf
    ) {
        super(nomeCompleto, telefone, email);
        this.cpf = cpf;
    }
}
