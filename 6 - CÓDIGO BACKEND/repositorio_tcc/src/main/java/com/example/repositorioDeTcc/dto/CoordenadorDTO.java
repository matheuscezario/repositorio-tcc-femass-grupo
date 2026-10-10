
package com.example.repositorioDeTcc.dto;

import com.example.repositorioDeTcc.model.Coordenador;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.util.UUID;

@NoArgsConstructor
@Getter
@Setter
public class CoordenadorDTO {

    private UUID id;
    private String nomeCompleto;
    private String telefone;
    private String email;
    private String cpf;

    private UUID idCurso;
    private String nomeCurso;

    public CoordenadorDTO(Coordenador entity) {
        BeanUtils.copyProperties(entity, this);

        if (entity.getCurso() != null) {
            this.idCurso = entity.getCurso().getId();
            this.nomeCurso = entity.getCurso().getNome();
        }
    }
}
