package com.example.repositorioDeTcc.mapper;

import com.example.repositorioDeTcc.dto.CoordenadorDTO;
import com.example.repositorioDeTcc.model.Coordenador;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CoordenadorMapper {

    @Autowired
    private ModelMapper mapper;

    public Coordenador fromCoordenadorDTOToCoordenador(CoordenadorDTO coordenadorDTO) {
        return new Coordenador(
                coordenadorDTO.getNomeCompleto(),
                coordenadorDTO.getTelefone(),
                coordenadorDTO.getEmail(),
                coordenadorDTO.getCpf()
        );
    }

    public CoordenadorDTO toCoordenadorDTO(Coordenador coordenador) {
        return new CoordenadorDTO(coordenador);
    }
}