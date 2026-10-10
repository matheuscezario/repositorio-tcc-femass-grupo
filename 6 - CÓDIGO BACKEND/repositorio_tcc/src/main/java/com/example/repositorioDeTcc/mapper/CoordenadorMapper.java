
package com.example.repositorioDeTcc.mapper;

import com.example.repositorioDeTcc.dto.CoordenadorDTO;
import com.example.repositorioDeTcc.model.Coordenador;
import com.example.repositorioDeTcc.model.Curso;
import org.springframework.stereotype.Component;

@Component
public class CoordenadorMapper {

    public Coordenador fromCoordenadorDTOToCoordenador(
            CoordenadorDTO coordenadorDTO,
            Curso curso
    ) {
        Coordenador coordenador = new Coordenador(
                coordenadorDTO.getNomeCompleto(),
                coordenadorDTO.getTelefone(),
                coordenadorDTO.getEmail(),
                coordenadorDTO.getCpf()
        );

        coordenador.setCurso(curso);

        return coordenador;
    }

    public CoordenadorDTO toCoordenadorDTO(
            Coordenador coordenador
    ) {
        return new CoordenadorDTO(coordenador);
    }
}
