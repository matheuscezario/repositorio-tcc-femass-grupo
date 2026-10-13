package com.example.repositorioDeTcc.dto;

import java.io.Serializable;
import java.util.List;

public record LoginResponseDTO(
        String token,
        String role,
        List<String> perfis,
        String nomeCompleto
) implements Serializable {
}