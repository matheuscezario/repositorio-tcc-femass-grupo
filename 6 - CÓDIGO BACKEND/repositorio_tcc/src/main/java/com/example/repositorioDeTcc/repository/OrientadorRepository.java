
package com.example.repositorioDeTcc.repository;

import com.example.repositorioDeTcc.model.Orientador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrientadorRepository
        extends JpaRepository<Orientador, UUID> {

    List<Orientador> findAllByAtivoIsTrue();

    Optional<Orientador> findByCpf(String cpf);

    Optional<Orientador> findByEmail(String email);

    boolean existsByCpfOrEmail(String cpf, String email);
}
