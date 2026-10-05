package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.dto.CoordenadorDTO;
import com.example.repositorioDeTcc.exception.ResourceNotFoundException;
import com.example.repositorioDeTcc.exception.handler.RequiredObjectIsNullException;
import com.example.repositorioDeTcc.mapper.CoordenadorMapper;
import com.example.repositorioDeTcc.model.Coordenador;
import com.example.repositorioDeTcc.repository.CoordenadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CoordenadorService {

    @Autowired
    CoordenadorRepository repository;

    @Autowired
    CoordenadorMapper coordenadorMapper;

    @Transactional(readOnly = true)
    public CoordenadorDTO findById(UUID id) {
        Optional<Coordenador> obj = repository.findById(id);
        return new CoordenadorDTO(
                obj.orElseThrow(() -> new ResourceNotFoundException(id))
        );
    }

    @Transactional(readOnly = true)
    public List<CoordenadorDTO> findAll() {
        List<Coordenador> list = repository.findAll();
        return list.stream()
                .map(CoordenadorDTO::new)
                .toList();
    }

    public CoordenadorDTO insert(CoordenadorDTO coordenadorDTO) {
        if (coordenadorDTO == null) {
            throw new RequiredObjectIsNullException();
        }

        Coordenador coordenador =
                coordenadorMapper.fromCoordenadorDTOToCoordenador(coordenadorDTO);

        return coordenadorMapper.toCoordenadorDTO(
                repository.save(coordenador)
        );
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        repository.deleteById(id);
    }

    @Transactional
    public CoordenadorDTO update(UUID id, CoordenadorDTO obj) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        Coordenador entity = repository.getReferenceById(id);
        updateData(entity, obj);

        return coordenadorMapper.toCoordenadorDTO(
                repository.save(entity)
        );
    }

    private void updateData(Coordenador entity, CoordenadorDTO obj) {
        entity.setNomeCompleto(obj.getNomeCompleto());
        entity.setEmail(obj.getEmail());
        entity.setTelefone(obj.getTelefone());
        entity.setCpf(obj.getCpf());
    }
}