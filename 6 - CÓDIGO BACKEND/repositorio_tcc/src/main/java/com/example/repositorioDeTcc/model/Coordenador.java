package com.example.repositorioDeTcc.model;

import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@NoArgsConstructor
@Table(name = "coordenador")
@Entity
public class Coordenador extends Pessoa {

    private String cpf;

    public Coordenador(String nomeCompleto, String telefone, String email, String cpf) {
        super(nomeCompleto, telefone, email);
        this.cpf = cpf;
    }
}