package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.dto.ProfessorTCCDTO;
import com.example.repositorioDeTcc.exception.ResourceNotFoundException;
import com.example.repositorioDeTcc.exception.handler.RequiredObjectIsNullException;
import com.example.repositorioDeTcc.mapper.ProfessorTCCMapper;
import com.example.repositorioDeTcc.model.ProfessorTCC;
import com.example.repositorioDeTcc.repository.ProfessorTCCRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.repositorioDeTcc.model.Curso;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import com.example.repositorioDeTcc.model.Curso;
import com.example.repositorioDeTcc.repository.CursoRepository;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.ss.usermodel.*;
import java.util.ArrayList;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProfessorTCCService {

    @Autowired
    ProfessorTCCRepository repository;

    
@Autowired
CursoRepository cursoRepository;


    @Autowired
    ProfessorTCCMapper professorTCCMapper;

    @Transactional(readOnly = true)
    public ProfessorTCCDTO findById(UUID id) {
        Optional<ProfessorTCC> obj = repository.findById(id);

        return new ProfessorTCCDTO(
                obj.orElseThrow(() -> new ResourceNotFoundException(id))
        );
    }

    @Transactional(readOnly = true)
    public List<ProfessorTCCDTO> findAll() {
        List<ProfessorTCC> list = repository.findAll();

        return list.stream()
                .map(ProfessorTCCDTO::new)
                .toList();
    }

    
@Transactional
public ProfessorTCCDTO insert(ProfessorTCCDTO professorTCCDTO) {
    if (professorTCCDTO == null) {
        throw new RequiredObjectIsNullException();
    }

    ProfessorTCC professorTCC =
            professorTCCMapper.fromProfessorTCCDTOToProfessorTCC(professorTCCDTO);

    return professorTCCMapper.toProfessorTCCDTO(
            repository.save(professorTCC)
    );
}

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        repository.deleteById(id);
    }

    @Transactional
    public ProfessorTCCDTO update(UUID id, ProfessorTCCDTO obj) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        ProfessorTCC entity = repository.getReferenceById(id);

        updateData(entity, obj);

        return professorTCCMapper.toProfessorTCCDTO(
                repository.save(entity)
        );
    }

    
private void updateData(ProfessorTCC entity, ProfessorTCCDTO obj) {
    entity.setNomeCompleto(obj.getNomeCompleto());
    entity.setEmail(obj.getEmail());
    entity.setTelefone(obj.getTelefone());
    entity.setCpf(obj.getCpf());

    ProfessorTCC professorAtualizado =
            professorTCCMapper.fromProfessorTCCDTOToProfessorTCC(obj);

    entity.setAtuaEmTodosCursos(
            professorAtualizado.isAtuaEmTodosCursos()
    );

    entity.getCursos().clear();

    if (!obj.isAtuaEmTodosCursos()) {
        entity.getCursos().addAll(
                professorAtualizado.getCursos()
        );
    }
}



@Transactional
public int importProfessores(
        MultipartFile file,
        List<UUID> cursosIds,
        boolean atuaEmTodosCursos
) throws IOException {

    Set<Curso> cursos = new HashSet<>();

    if (!atuaEmTodosCursos) {
        if (cursosIds == null || cursosIds.isEmpty()) {
            throw new IllegalArgumentException("Selecione um curso.");
        }

        for (UUID id : cursosIds) {
            cursos.add(cursoRepository.findById(id)
                    .orElseThrow(() ->
                            new IllegalArgumentException("Curso inválido: " + id)));
        }
    }

    List<ProfessorTCC> professores = new ArrayList<>();

    
if (file.getOriginalFilename() != null
        && file.getOriginalFilename().toLowerCase().endsWith(".csv")) {

    try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(
                    file.getInputStream(),
                    StandardCharsets.UTF_8
            ))) {

        String cabecalho = reader.readLine();

        if (cabecalho == null) {
            throw new IllegalArgumentException("CSV vazio.");
        }

        String separador = cabecalho.contains(";") ? ";" : ",";
        String[] colunas = cabecalho.split(separador, -1);

        java.util.Map<String, Integer> indices = new java.util.HashMap<>();

        for (int i = 0; i < colunas.length; i++) {
            indices.put(
                    colunas[i].replace("\uFEFF", "").trim().toLowerCase(),
                    i
            );
        }

        for (String coluna : List.of("nome", "cpf", "e-mail", "celular")) {
            if (!indices.containsKey(coluna)) {
                throw new IllegalArgumentException(
                        "Coluna obrigatória ausente: " + coluna
                );
            }
        }

        String linha;

        while ((linha = reader.readLine()) != null) {
            if (linha.isBlank()) continue;

            String[] valores = linha.split(separador, -1);

            if (valores.length < colunas.length) {
                throw new IllegalArgumentException(
                        "Linha CSV incompleta."
                );
            }

            String nome = valores[indices.get("nome")].trim();
            String cpf = valores[indices.get("cpf")]
                    .replaceAll("[^0-9]", "");
            String email = valores[indices.get("e-mail")].trim();
            String telefone = valores[indices.get("celular")]
                    .replaceAll("[^0-9]", "");

            if (nome.isBlank() && cpf.isBlank() && email.isBlank()) {
                continue;
            }

            if (nome.isBlank() || cpf.isBlank() || email.isBlank()) {
                throw new IllegalArgumentException(
                        "Dados obrigatórios ausentes no CSV."
                );
            }

            if (repository.existsByCpfOrEmail(cpf, email)) {
                continue;
            }

            boolean duplicado = professores.stream()
                    .anyMatch(p ->
                            p.getCpf().equals(cpf)
                            || p.getEmail().equalsIgnoreCase(email)
                    );

            if (duplicado) continue;

            ProfessorTCC professor =
                    new ProfessorTCC(nome, telefone, email, cpf);

            professor.setAtuaEmTodosCursos(atuaEmTodosCursos);
            professor.setCursos(new HashSet<>(cursos));

            professores.add(professor);
        }
    }

    repository.saveAll(professores);
    return professores.size();
}


try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
        Sheet sheet = workbook.getSheetAt(0);
        Row header = sheet.getRow(0);

        if (header == null) {
            throw new IllegalArgumentException("Planilha sem cabeçalho.");
        }

        DataFormatter formatter = new DataFormatter();
        java.util.Map<String, Integer> colunas = new java.util.HashMap<>();

        for (Cell cell : header) {
            colunas.put(
                    formatter.formatCellValue(cell).trim().toLowerCase(),
                    cell.getColumnIndex()
            );
        }

        for (String obrigatoria : List.of("nome", "cpf", "e-mail", "celular")) {
            if (!colunas.containsKey(obrigatoria)) {
                throw new IllegalArgumentException(
                        "Coluna obrigatória ausente: " + obrigatoria
                );
            }
        }

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String nome = formatter.formatCellValue(
                    row.getCell(colunas.get("nome"))).trim();
            String cpf = formatter.formatCellValue(
                    row.getCell(colunas.get("cpf"))).replaceAll("[^0-9]", "");
            String email = formatter.formatCellValue(
                    row.getCell(colunas.get("e-mail"))).trim();
            String telefone = formatter.formatCellValue(
                    row.getCell(colunas.get("celular"))).replaceAll("[^0-9]", "");

            if (nome.isBlank() && cpf.isBlank() && email.isBlank()) continue;

            if (nome.isBlank() || cpf.isBlank() || email.isBlank()) {
                throw new IllegalArgumentException(
                        "Dados obrigatórios ausentes na linha " + (i + 1)
                );
            }

            
if (repository.existsByCpfOrEmail(cpf, email)) {
    continue;
}

boolean duplicadoNaPlanilha = professores.stream()
        .anyMatch(p ->
                p.getCpf().equals(cpf)
                || p.getEmail().equalsIgnoreCase(email)
        );

if (duplicadoNaPlanilha) {
    continue;
}

            ProfessorTCC professor =
                    new ProfessorTCC(nome, telefone, email, cpf);

            professor.setAtuaEmTodosCursos(atuaEmTodosCursos);
            professor.setCursos(new HashSet<>(cursos));

            professores.add(professor);
        }
    }

    
if (professores.isEmpty()) {
    return 0;
}

    repository.saveAll(professores);
    return professores.size();
}

}