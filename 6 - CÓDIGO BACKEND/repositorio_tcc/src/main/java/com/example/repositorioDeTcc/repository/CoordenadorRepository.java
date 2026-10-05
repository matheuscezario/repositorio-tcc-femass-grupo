package com.example.repositorioDeTcc.repository;

import com.example.repositorioDeTcc.model.Coordenador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CoordenadorRepository extends JpaRepository<Coordenador, UUID> {

    Optional<Coordenador> findByCpf(String cpf);
}