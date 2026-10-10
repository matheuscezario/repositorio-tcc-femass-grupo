
package com.example.repositorioDeTcc.mapper;

import com.example.repositorioDeTcc.dto.OrientadorDTO;
import com.example.repositorioDeTcc.model.Curso;
import com.example.repositorioDeTcc.model.Orientador;
import com.example.repositorioDeTcc.repository.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class OrientadorMapper {

    @Autowired
    private CursoRepository cursoRepository;

    public Orientador fromOrientadorDTOToOrientador(
            OrientadorDTO dto
    ) {
        Orientador orientador = new Orientador(
            dto.getNomeCompleto(),
            dto.getTelefone(),
            dto.getEmail(),
            dto.getCpf()
        );

        orientador.setAtuaEmTodosCursos(
            dto.isAtuaEmTodosCursos()
        );

        if (dto.isAtuaEmTodosCursos()) {
            orientador.setCursos(new HashSet<>());
        } else {
            Set<UUID> cursosIds = dto.getCursosIds();

            if (cursosIds != null && !cursosIds.isEmpty()) {
                Set<Curso> cursos = new HashSet<>(
                    cursoRepository.findAllById(cursosIds)
                );

                if (cursos.size() != cursosIds.size()) {
                    throw new IllegalArgumentException(
                        "Um ou mais cursos não foram encontrados."
                    );
                }

                orientador.setCursos(cursos);
            }
        }

        return orientador;
    }

    public OrientadorDTO toOrientadorDTO(
            Orientador orientador
    ) {
        return new OrientadorDTO(orientador);
    }
}
