package com.example.repositorioDeTcc.dto;

import java.util.List;

public record LoginResponseMustChangeDTO(
        String token,
        boolean mustChangePassword,
        String role,
        List<String> perfis,
        String nomeCompleto
) {
}