package com.example.repositorioDeTcc.repository;

import com.example.repositorioDeTcc.model.TCC;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TCCRepository extends JpaRepository<TCC, UUID> {

    public TCC findByAlunoMatricula(String matricula);

    List<TCC> findByOrientadorId(UUID orientadorId);

    List<TCC> findByCursoId(UUID cursoId);

    Optional<TCC> findByAlunoId(UUID alunoId);
}