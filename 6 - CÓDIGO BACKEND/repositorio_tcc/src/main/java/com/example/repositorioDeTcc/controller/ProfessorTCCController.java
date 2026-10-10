package com.example.repositorioDeTcc.controller;

import com.example.repositorioDeTcc.dto.ProfessorTCCDTO;
import com.example.repositorioDeTcc.service.ProfessorTCCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/professores")
@CrossOrigin
public class ProfessorTCCController {

    @Autowired
    ProfessorTCCService service;

    @GetMapping(value = "/{id}")
    public ResponseEntity<ProfessorTCCDTO> findById(@PathVariable UUID id) {
        ProfessorTCCDTO result = service.findById(id);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping
    public ResponseEntity<List<ProfessorTCCDTO>> findAll() {
        List<ProfessorTCCDTO> result = service.findAll();
        return ResponseEntity.ok().body(result);
    }

    @PostMapping(
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ProfessorTCCDTO> create(
            @RequestBody ProfessorTCCDTO professor
    ) {
        professor = service.insert(professor);
        return ResponseEntity.ok().body(professor);
    }

    @PutMapping(
            value = "/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ProfessorTCCDTO> update(
            @PathVariable UUID id,
            @RequestBody ProfessorTCCDTO professor
    ) {
        professor = service.update(id, professor);
        return ResponseEntity.ok().body(professor);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    
@PostMapping(
        value = "/import",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<Integer> importProfessores(
        @RequestPart("file") MultipartFile file,
        @RequestParam(
                value = "cursosIds",
                required = false
        ) List<UUID> cursosIds,
        @RequestParam(
                value = "atuaEmTodosCursos",
                defaultValue = "false"
        ) boolean atuaEmTodosCursos
) throws IOException {

    if (file.isEmpty()) {
        return ResponseEntity.badRequest().body(-1);
    }

    String fileName = file.getOriginalFilename();

    if (fileName == null ||
            !(fileName.toLowerCase().endsWith(".xlsx")
                    || fileName.toLowerCase().endsWith(".xls")
                    || fileName.toLowerCase().endsWith(".csv"))) {

        return ResponseEntity.badRequest().body(-2);
    }

    if (!atuaEmTodosCursos &&
            (cursosIds == null || cursosIds.isEmpty())) {

        return ResponseEntity.badRequest().body(-3);
    }

    int quantidade = service.importProfessores(
            file,
            cursosIds,
            atuaEmTodosCursos
    );

    return ResponseEntity.ok(quantidade);
}

}