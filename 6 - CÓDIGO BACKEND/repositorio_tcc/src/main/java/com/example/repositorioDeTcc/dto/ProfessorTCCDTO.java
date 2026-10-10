
package com.example.repositorioDeTcc.dto;

import com.example.repositorioDeTcc.model.Curso;
import com.example.repositorioDeTcc.model.ProfessorTCC;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@NoArgsConstructor
@Getter
@Setter
public class ProfessorTCCDTO {

    private UUID id;
    private String nomeCompleto;
    private String telefone;
    private String email;
    private String cpf;

    private boolean atuaEmTodosCursos = false;
    private Set<UUID> cursosIds = new HashSet<>();

    public ProfessorTCCDTO(ProfessorTCC entity) {
        BeanUtils.copyProperties(entity, this);

        this.cursosIds = entity.getCursos() == null
                ? new HashSet<>()
                : entity.getCursos()
                    .stream()
                    .map(Curso::getId)
                    .collect(Collectors.toSet());
    }
}
