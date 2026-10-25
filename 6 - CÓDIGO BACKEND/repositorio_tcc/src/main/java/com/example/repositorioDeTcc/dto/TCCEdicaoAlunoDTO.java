package com.example.repositorioDeTcc.dto;

import java.util.UUID;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class TCCEdicaoAlunoDTO {

    private String titulo;
    private String resumo;
    private UUID idSubcategoria;

}