package com.example.repositorioDeTcc.dto;

import com.example.repositorioDeTcc.model.Orientador;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@NoArgsConstructor
@Getter
@Setter
public class OrientadorMinDTO {

    private UUID id;
    private String nomeCompleto;
    private String cpf;
    private String email;

    private boolean atuaEmTodosCursos;
    private Set<UUID> cursosIds;

    public OrientadorMinDTO(Orientador entity) {
        BeanUtils.copyProperties(entity, this);

        this.atuaEmTodosCursos = entity.isAtuaEmTodosCursos();

        this.cursosIds = entity.getCursos()
                .stream()
                .map(curso -> curso.getId())
                .collect(Collectors.toSet());
    }
}