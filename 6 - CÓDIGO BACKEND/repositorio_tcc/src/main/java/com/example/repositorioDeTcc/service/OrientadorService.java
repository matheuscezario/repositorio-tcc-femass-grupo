
package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.dto.OrientadorDTO;
import com.example.repositorioDeTcc.dto.OrientadorMinDTO;
import com.example.repositorioDeTcc.exception.ResourceNotFoundException;
import com.example.repositorioDeTcc.exception.handler.RequiredObjectIsNullException;
import com.example.repositorioDeTcc.mapper.OrientadorMapper;
import com.example.repositorioDeTcc.model.Curso;
import com.example.repositorioDeTcc.model.Orientador;
import com.example.repositorioDeTcc.repository.CursoRepository;
import com.example.repositorioDeTcc.repository.OrientadorRepository;


import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Locale;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class OrientadorService {

    @Autowired
    private OrientadorRepository repository;

    @Autowired
    private OrientadorMapper orientadorMapper;

    @Autowired
    private CursoRepository cursoRepository;

    @Transactional(readOnly = true)
    public OrientadorDTO findById(UUID id) {
        Orientador orientador = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(id));

        return orientadorMapper.toOrientadorDTO(orientador);
    }

    @Transactional(readOnly = true)
    public OrientadorDTO findByEmail(String email) {
        Orientador orientador = repository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("Orientador não encontrado")
            );

        return orientadorMapper.toOrientadorDTO(orientador);
    }

    @Transactional(readOnly = true)
    public List<OrientadorMinDTO> findAll() {
        return repository.findAllByAtivoIsTrue()
            .stream()
            .map(OrientadorMinDTO::new)
            .toList();
    }

    @Transactional
    public OrientadorDTO insert(OrientadorDTO dto) {
        if (dto == null) {
            throw new RequiredObjectIsNullException();
        }

        Orientador orientador =
            orientadorMapper.fromOrientadorDTOToOrientador(dto);

        return orientadorMapper.toOrientadorDTO(
            repository.save(orientador)
        );
    }

    @Transactional
    public OrientadorDTO update(UUID id, OrientadorDTO dto) {
        if (dto == null) {
            throw new RequiredObjectIsNullException();
        }

        Orientador orientador = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(id));

        updateData(orientador, dto);

        return orientadorMapper.toOrientadorDTO(
            repository.save(orientador)
        );
    }

    private void updateData(Orientador entity, OrientadorDTO dto) {
        entity.setNomeCompleto(dto.getNomeCompleto());
        entity.setEmail(dto.getEmail());
        entity.setTelefone(dto.getTelefone());
        entity.setCpf(dto.getCpf());

        entity.setAtuaEmTodosCursos(dto.isAtuaEmTodosCursos());

        if (dto.isAtuaEmTodosCursos()) {
            entity.getCursos().clear();
        } else {
            Set<UUID> cursosIds = dto.getCursosIds();

            if (cursosIds != null) {
                Set<Curso> cursos = new HashSet<>(
                    cursoRepository.findAllById(cursosIds)
                );

                if (cursos.size() != cursosIds.size()) {
                    throw new IllegalArgumentException(
                        "Um ou mais cursos não foram encontrados."
                    );
                }

                entity.getCursos().clear();
                entity.getCursos().addAll(cursos);
            }
        }
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        repository.deleteById(id);
    }

    
@Transactional
public int importOrientadores(
        MultipartFile file,
        List<UUID> cursosIds,
        boolean atuaEmTodosCursos
) throws Exception {

    if (file == null || file.isEmpty()) {
        throw new IllegalArgumentException("Arquivo vazio.");
    }

    String nomeArquivo = file.getOriginalFilename() == null
            ? ""
            : file.getOriginalFilename().toLowerCase(Locale.ROOT);

    if (!nomeArquivo.endsWith(".csv")
            && !nomeArquivo.endsWith(".xls")
            && !nomeArquivo.endsWith(".xlsx")) {
        throw new IllegalArgumentException("Formato de arquivo inválido.");
    }

    Set<Curso> cursos = new HashSet<>();

    if (!atuaEmTodosCursos) {
        if (cursosIds == null || cursosIds.isEmpty()) {
            throw new IllegalArgumentException("Selecione ao menos um curso.");
        }

        cursos.addAll(cursoRepository.findAllById(cursosIds));

        if (cursos.size() != new HashSet<>(cursosIds).size()) {
            throw new IllegalArgumentException("Curso não encontrado.");
        }
    }

    Set<String> cpfsImportados = new HashSet<>();
    Set<String> emailsImportados = new HashSet<>();
    int quantidade = 0;

    if (nomeArquivo.endsWith(".csv")) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String linha = reader.readLine();
            if (linha == null) return 0;

            while ((linha = reader.readLine()) != null) {
                if (linha.isBlank()) continue;

                String separador = linha.contains(";") ? ";" : ",";
                String[] colunas = linha.split(separador, -1);

                if (colunas.length < 4) continue;

                if (salvarOrientadorImportado(
                        colunas[0], colunas[1], colunas[2], colunas[3],
                        atuaEmTodosCursos, cursos,
                        cpfsImportados, emailsImportados)) {
                    quantidade++;
                }
            }
        }
    } else {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String[] valores = new String[4];

                for (int j = 0; j < 4; j++) {
                    Cell cell = row.getCell(j);
                    valores[j] = cell == null
                            ? ""
                            : formatter.formatCellValue(cell);
                }

                if (salvarOrientadorImportado(
                        valores[0], valores[1], valores[2], valores[3],
                        atuaEmTodosCursos, cursos,
                        cpfsImportados, emailsImportados)) {
                    quantidade++;
                }
            }
        }
    }

    return quantidade;
}

private boolean salvarOrientadorImportado(
        String nome,
        String cpf,
        String email,
        String telefone,
        boolean atuaEmTodosCursos,
        Set<Curso> cursos,
        Set<String> cpfsImportados,
        Set<String> emailsImportados
) {
    nome = nome.trim();
    cpf = cpf.replaceAll("\\D", "");
    email = email.trim().toLowerCase(Locale.ROOT);
    telefone = telefone.replaceAll("\\D", "");

    if (nome.isBlank() || cpf.isBlank() || email.isBlank()) {
        return false;
    }

    if (cpfsImportados.contains(cpf)
            || emailsImportados.contains(email)
            || repository.existsByCpfOrEmail(cpf, email)) {
        return false;
    }

    Orientador orientador = new Orientador(
            nome, telefone, email, cpf
    );

    orientador.setAtuaEmTodosCursos(atuaEmTodosCursos);
    orientador.setCursos(new HashSet<>(cursos));

    repository.save(orientador);

    cpfsImportados.add(cpf);
    emailsImportados.add(email);

    return true;
}

}
