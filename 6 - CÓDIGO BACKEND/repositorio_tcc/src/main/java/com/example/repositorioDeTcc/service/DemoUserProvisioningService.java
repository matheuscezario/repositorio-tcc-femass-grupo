package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.model.Pessoa;
import com.example.repositorioDeTcc.model.Role;
import com.example.repositorioDeTcc.model.User;
import com.example.repositorioDeTcc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemoUserProvisioningService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${gestortcc.demo.enabled:false}")
    private boolean demoEnabled;

    @Value("${GESTORTCC_DEMO_PASSWORD:}")
    private String demoPassword;

    public DemoUserProvisioningService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void criarContaSeNecessario(Pessoa pessoa, String matricula) {
        if (!demoEnabled || pessoa == null) {
            return;
        }

        if (!Boolean.TRUE.equals(pessoa.getAtivo())) {
            return;
        }

        if (pessoa.getUser() != null) {
            return;
        }

        if (demoPassword == null || demoPassword.isBlank()) {
            throw new IllegalStateException(
                    "Senha de demonstracao nao configurada"
            );
        }

        String email = pessoa.getEmail();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Email obrigatorio para criar conta de demonstracao"
            );
        }

        if (userRepository.findByEmail(email) != null) {
            throw new IllegalStateException(
                    "Ja existe uma conta com este email"
            );
        }

        if (matricula != null && !matricula.isBlank()
                && userRepository.findByMatricula(matricula) != null) {
            throw new IllegalStateException(
                    "Ja existe uma conta com esta matricula"
            );
        }

        User usuario = new User(
                pessoa.getNomeCompleto(),
                matricula,
                email,
                passwordEncoder.encode(demoPassword),
                Role.USER
        );

        usuario.setEnabled(true);
        usuario.setMustChangePassword(false);

        userRepository.save(usuario);
        pessoa.setUser(usuario);
    }
}