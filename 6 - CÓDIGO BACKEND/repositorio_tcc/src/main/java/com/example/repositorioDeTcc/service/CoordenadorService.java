package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.dto.CoordenadorDTO;
import com.example.repositorioDeTcc.exception.ResourceNotFoundException;
import com.example.repositorioDeTcc.exception.handler.RequiredObjectIsNullException;
import com.example.repositorioDeTcc.mapper.CoordenadorMapper;
import com.example.repositorioDeTcc.model.Coordenador;
import com.example.repositorioDeTcc.model.Curso;
import com.example.repositorioDeTcc.repository.CoordenadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.repositorioDeTcc.repository.CursoRepository;


import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CoordenadorService {

    @Autowired
    CoordenadorRepository repository;

    @Autowired
CursoRepository cursoRepository;

    @Autowired
    CoordenadorMapper coordenadorMapper;

    @Transactional(readOnly = true)
    public CoordenadorDTO findById(UUID id) {
        Optional<Coordenador> obj = repository.findById(id);
        return new CoordenadorDTO(
                obj.orElseThrow(() -> new ResourceNotFoundException(id))
        );
    }

    @Transactional(readOnly = true)
    public List<CoordenadorDTO> findAll() {
        List<Coordenador> list = repository.findAll();
        return list.stream()
                .map(CoordenadorDTO::new)
                .toList();
    }

    
@Transactional
public CoordenadorDTO insert(CoordenadorDTO coordenadorDTO) {
    if (coordenadorDTO == null) {
        throw new RequiredObjectIsNullException();
    }

    if (coordenadorDTO.getIdCurso() == null) {
        throw new IllegalArgumentException(
                "É obrigatório selecionar um curso."
        );
    }

    Curso curso = cursoRepository.findById(
            coordenadorDTO.getIdCurso()
    ).orElseThrow(() -> new IllegalArgumentException(
            "O curso selecionado não foi encontrado."
    ));

    Coordenador coordenador =
            coordenadorMapper.fromCoordenadorDTOToCoordenador(
                    coordenadorDTO,
                    curso
            );

    return coordenadorMapper.toCoordenadorDTO(
            repository.save(coordenador)
    );
}


    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        repository.deleteById(id);
    }

    @Transactional
    public CoordenadorDTO update(UUID id, CoordenadorDTO obj) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }

        Coordenador entity = repository.getReferenceById(id);
        updateData(entity, obj);

        return coordenadorMapper.toCoordenadorDTO(
                repository.save(entity)
        );
    }

    
private void updateData(Coordenador entity, CoordenadorDTO obj) {
    if (obj == null) {
        throw new RequiredObjectIsNullException();
    }

    if (obj.getIdCurso() == null) {
        throw new IllegalArgumentException(
                "É obrigatório selecionar um curso."
        );
    }

    Curso curso = cursoRepository.findById(
            obj.getIdCurso()
    ).orElseThrow(() -> new IllegalArgumentException(
            "O curso selecionado não foi encontrado."
    ));

    entity.setNomeCompleto(obj.getNomeCompleto());
    entity.setEmail(obj.getEmail());
    entity.setTelefone(obj.getTelefone());
    entity.setCpf(obj.getCpf());
    entity.setCurso(curso);
}


    
@Transactional
public int importCoordenadores(MultipartFile file, UUID idCurso) {
    if (idCurso == null) {
    throw new IllegalArgumentException(
        "É obrigatório selecionar um curso para a importação."
    );
}

Curso curso = cursoRepository.findById(idCurso)
    .orElseThrow(() -> new IllegalArgumentException(
        "O curso selecionado não foi encontrado."
    ));
    if (file == null || file.isEmpty()) {
        throw new IllegalArgumentException("Arquivo vazio.");
    }

    String nomeArquivo = file.getOriginalFilename();

    if (nomeArquivo == null) {
        throw new IllegalArgumentException("Nome do arquivo inválido.");
    }

    String extensao = nomeArquivo.toLowerCase();
    List<String[]> linhas = new ArrayList<>();

    try {
        if (extensao.endsWith(".csv")) {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(
                            file.getInputStream(),
                            StandardCharsets.UTF_8
                    ))) {

                String linha;

                while ((linha = reader.readLine()) != null) {
                    if (!linha.isBlank()) {
                        String separador = linha.contains(";") ? ";" : ",";
                        linhas.add(linha.split(separador, -1));
                    }
                }
            }

        } else if (extensao.endsWith(".xls") ||
                   extensao.endsWith(".xlsx")) {

            try (Workbook workbook = WorkbookFactory.create(
                    file.getInputStream())) {

                Sheet sheet = workbook.getSheetAt(0);
                DataFormatter formatter = new DataFormatter();

                for (Row row : sheet) {
                    String[] valores = new String[4];

                    for (int i = 0; i < 4; i++) {
                        Cell cell = row.getCell(i);
                        valores[i] = cell == null
                                ? ""
                                : formatter.formatCellValue(cell);
                    }

                    linhas.add(valores);
                }
            }

        } else {
            throw new IllegalArgumentException(
                    "Formato inválido. Utilize CSV, XLS ou XLSX."
            );
        }

        int quantidade = 0;

        // Primeira linha: cabeçalho
        for (int i = 1; i < linhas.size(); i++) {
            String[] colunas = linhas.get(i);

            if (colunas.length < 4) {
                continue;
            }

            String nome = colunas[0].trim();
            String cpf = colunas[1].replaceAll("\\D", "");
            String email = colunas[2].trim();
            String telefone = colunas[3].replaceAll("\\D", "");

            if (nome.isBlank() || cpf.isBlank() ||
                email.isBlank() || telefone.isBlank()) {
                continue;
            }

            if (repository.existsByCpfOrEmail(cpf, email)) {
                continue;
            }

            CoordenadorDTO dto = new CoordenadorDTO();
            dto.setNomeCompleto(nome);
            dto.setCpf(cpf);
            dto.setEmail(email);
            dto.setTelefone(telefone);

            Coordenador coordenador =
        coordenadorMapper.fromCoordenadorDTOToCoordenador(
                dto,
                curso
        );

            repository.save(coordenador);
            quantidade++;
        }

        return quantidade;

    } catch (java.io.IOException e) {
        throw new IllegalArgumentException(
                "Não foi possível ler o arquivo.", e
        );
    }
}

}