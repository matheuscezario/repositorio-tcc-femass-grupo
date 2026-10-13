package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.model.User;
import com.example.repositorioDeTcc.model.Role;
import com.example.repositorioDeTcc.repository.AlunoRepository;
import com.example.repositorioDeTcc.repository.OrientadorRepository;
import com.example.repositorioDeTcc.repository.CoordenadorRepository;
import com.example.repositorioDeTcc.repository.ProfessorTCCRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PerfilUsuarioService {

    private final AlunoRepository alunoRepository;
    private final OrientadorRepository orientadorRepository;
    private final CoordenadorRepository coordenadorRepository;
    private final ProfessorTCCRepository professorRepository;

    public PerfilUsuarioService(
            AlunoRepository alunoRepository,
            OrientadorRepository orientadorRepository,
            CoordenadorRepository coordenadorRepository,
            ProfessorTCCRepository professorRepository) {

        this.alunoRepository = alunoRepository;
        this.orientadorRepository = orientadorRepository;
        this.coordenadorRepository = coordenadorRepository;
        this.professorRepository = professorRepository;
    }

    public List<String> buscarPerfis(User user) {

        List<String> perfis = new ArrayList<>();

        if (user.getRole() == Role.ADMIN) {
            perfis.add("ADMIN");
        }

        String email = user.getEmail();

        if (email == null || email.isBlank()) {
            return perfis;
        }

        alunoRepository.findByEmail(email)
                .filter(aluno -> user.getId().equals(
                        aluno.getUser() != null
                                ? aluno.getUser().getId()
                                : null))
                .ifPresent(aluno -> perfis.add("ALUNO"));

        orientadorRepository.findByEmail(email)
                .filter(orientador -> user.getId().equals(
                        orientador.getUser() != null
                                ? orientador.getUser().getId()
                                : null))
                .ifPresent(orientador -> perfis.add("ORIENTADOR"));

        coordenadorRepository.findByEmail(email)
                .filter(coordenador -> user.getId().equals(
                        coordenador.getUser() != null
                                ? coordenador.getUser().getId()
                                : null))
                .ifPresent(coordenador -> perfis.add("COORDENADOR"));

        professorRepository.findByEmail(email)
                .filter(professor -> user.getId().equals(
                        professor.getUser() != null
                                ? professor.getUser().getId()
                                : null))
                .ifPresent(professor -> perfis.add("PROFESSOR"));

        return perfis;
    }
}