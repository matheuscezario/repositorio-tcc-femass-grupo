package com.example.repositorioDeTcc.controller;

import com.example.repositorioDeTcc.dto.CoordenadorDTO;
import com.example.repositorioDeTcc.service.CoordenadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/coordenadores")
@CrossOrigin
public class CoordenadorController {

    @Autowired
    CoordenadorService service;

    @GetMapping(value = "/{id}")
    public ResponseEntity<CoordenadorDTO> findById(@PathVariable UUID id) {
        CoordenadorDTO result = service.findById(id);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping
    public ResponseEntity<List<CoordenadorDTO>> findAll() {
        List<CoordenadorDTO> result = service.findAll();
        return ResponseEntity.ok().body(result);
    }

    @PostMapping(
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CoordenadorDTO> create(
            @RequestBody CoordenadorDTO coordenador
    ) {
        coordenador = service.insert(coordenador);
        return ResponseEntity.ok().body(coordenador);
    }

    @PutMapping(
            value = "/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CoordenadorDTO> update(
            @PathVariable UUID id,
            @RequestBody CoordenadorDTO coordenador
    ) {
        coordenador = service.update(id, coordenador);
        return ResponseEntity.ok().body(coordenador);
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
public ResponseEntity<Integer> importCoordenadores(
        @RequestParam("file") MultipartFile file,
        @RequestParam("idCurso") UUID idCurso
) {
    int quantidade = service.importCoordenadores(
            file,
            idCurso
    );

    return ResponseEntity.ok(quantidade);
}


}