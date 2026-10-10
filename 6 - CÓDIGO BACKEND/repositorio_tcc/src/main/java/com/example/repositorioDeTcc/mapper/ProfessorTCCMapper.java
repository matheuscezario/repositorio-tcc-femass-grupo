
package com.example.repositorioDeTcc.mapper;

import com.example.repositorioDeTcc.dto.ProfessorTCCDTO;
import com.example.repositorioDeTcc.model.Curso;
import com.example.repositorioDeTcc.model.ProfessorTCC;
import com.example.repositorioDeTcc.repository.CursoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class ProfessorTCCMapper {

    @Autowired
    private CursoRepository cursoRepository;

    public ProfessorTCC fromProfessorTCCDTOToProfessorTCC(
            ProfessorTCCDTO dto
    ) {
        ProfessorTCC professor = new ProfessorTCC(
                dto.getNomeCompleto(),
                dto.getTelefone(),
                dto.getEmail(),
                dto.getCpf()
        );

        professor.setAtuaEmTodosCursos(
                dto.isAtuaEmTodosCursos()
        );

        if (!dto.isAtuaEmTodosCursos()
                && dto.getCursosIds() != null) {

            Set<Curso> cursos = new HashSet<>();

            for (UUID cursoId : dto.getCursosIds()) {
                Curso curso = cursoRepository.findById(cursoId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Curso não encontrado: " + cursoId
                                )
                        );

                cursos.add(curso);
            }

            professor.setCursos(cursos);
        }

        return professor;
    }

    public ProfessorTCCDTO toProfessorTCCDTO(
            ProfessorTCC professorTCC
    ) {
        return new ProfessorTCCDTO(professorTCC);
    }
}
