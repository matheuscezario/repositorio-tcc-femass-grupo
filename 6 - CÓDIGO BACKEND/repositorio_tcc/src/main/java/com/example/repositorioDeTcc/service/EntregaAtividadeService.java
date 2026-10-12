package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.dto.EntregaAtividadeDTO;
import com.example.repositorioDeTcc.dto.LancarNotaDTO;
import com.example.repositorioDeTcc.exception.ResourceNotFoundException;
import com.example.repositorioDeTcc.model.Aluno;
import com.example.repositorioDeTcc.model.Atividade;
import com.example.repositorioDeTcc.model.EntregaAtividade;
import com.example.repositorioDeTcc.repository.AlunoRepository;
import com.example.repositorioDeTcc.repository.AtividadeRepository;
import com.example.repositorioDeTcc.repository.EntregaAtividadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.repositorioDeTcc.model.TCC;
import com.example.repositorioDeTcc.model.User;
import com.example.repositorioDeTcc.repository.TCCRepository;
import com.example.repositorioDeTcc.repository.CoordenadorRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
public class EntregaAtividadeService {

    @Value("${upload.dir:uploads/atividades}")
    private String uploadDir;

    @Autowired
    EntregaAtividadeRepository repository;

    @Autowired
    AtividadeRepository atividadeRepository;

    @Autowired
    AlunoRepository alunoRepository;

    @Autowired
TCCRepository tccRepository;

@Autowired
CoordenadorRepository coordenadorRepository;

    @Transactional(readOnly = true)
    public EntregaAtividadeDTO findById(UUID id) {
        Optional<EntregaAtividade> obj = repository.findById(id);
        return new EntregaAtividadeDTO(obj.orElseThrow(() -> new ResourceNotFoundException(id)));
    }

    /**
     * Aluno registra entrega com upload de arquivo.
     */
    @Transactional
    public EntregaAtividadeDTO entregar(UUID atividadeId, MultipartFile file, Principal connectedUser) throws IOException {
        String email = connectedUser.getName();
        Optional<Aluno> alunoOpt = alunoRepository.findByEmail(email);
        if (alunoOpt.isEmpty()) throw new RuntimeException("Aluno não encontrado para o usuário logado");

        Aluno aluno = alunoOpt.get();
        Atividade atividade = atividadeRepository.findById(atividadeId)
                .orElseThrow(() -> new ResourceNotFoundException(atividadeId));

        Optional<EntregaAtividade> existente = repository.findByAtividadeIdAndAlunoId(atividadeId, aluno.getId());
        EntregaAtividade entrega = existente.orElse(new EntregaAtividade(atividade, aluno));

        if (file != null && !file.isEmpty()) {
            String fileName = salvarArquivo(file, atividadeId, aluno.getId());
            entrega.setArquivoNome(file.getOriginalFilename());
            entrega.setArquivoCaminho(fileName);
        }

        entrega.setDataRealizacao(LocalDate.now());
        return new EntregaAtividadeDTO(repository.save(entrega));
    }

    /**
     * Professor lança nota para uma entrega.
     */
    @Transactional
    public EntregaAtividadeDTO lancarNota(UUID entregaId, LancarNotaDTO dto) {
        EntregaAtividade entrega = repository.findById(entregaId)
                .orElseThrow(() -> new ResourceNotFoundException(entregaId));
        entrega.setNota(dto.getNota());
        return new EntregaAtividadeDTO(repository.save(entrega));
    }

    /**
     * Retorna o arquivo para download.
     */
    @Transactional(readOnly = true)
public Resource downloadArquivo(UUID entregaId) throws MalformedURLException {

    EntregaAtividade entrega = repository.findById(entregaId)
            .orElseThrow(() -> new ResourceNotFoundException(entregaId));

    var authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null ||
            !(authentication.getPrincipal() instanceof User usuario)) {
        throw new AccessDeniedException("Usuário não autenticado.");
    }

    Aluno aluno = entrega.getAluno();

    boolean proprioAluno = usuario.getMatricula() != null
            && usuario.getMatricula().equals(aluno.getMatricula());

    boolean orientadorResponsavel = false;
    boolean coordenadorResponsavel = false;

    // Procura a proposta de TCC vinculada ao aluno.
    // Ajustaremos a consulta conforme os métodos existentes no repositório.
    Optional<TCC> tccOpt = tccRepository.findByAlunoId(aluno.getId());

    if (tccOpt.isPresent()) {
        TCC tcc = tccOpt.get();

        orientadorResponsavel = usuario.getEmail() != null
                && tcc.getOrientador() != null
                && tcc.getOrientador().getEmail() != null
                && usuario.getEmail().equalsIgnoreCase(
                        tcc.getOrientador().getEmail()
                );

        if (usuario.getEmail() != null && tcc.getCurso() != null) {
            var coordenador = coordenadorRepository.findByEmail(
                    usuario.getEmail()
            );

            coordenadorResponsavel = coordenador.isPresent()
                    && coordenador.get().getCurso() != null
                    && coordenador.get().getCurso().getId()
                            .equals(tcc.getCurso().getId());
        }
    }

    if (!proprioAluno && !orientadorResponsavel && !coordenadorResponsavel) {
        throw new AccessDeniedException(
                "Você não possui permissão para baixar este arquivo."
        );
    }

    if (entrega.getArquivoCaminho() == null) {
        throw new RuntimeException(
                "Nenhum arquivo associado a esta entrega"
        );
    }

    Path filePath = Paths.get(uploadDir)
            .resolve(entrega.getArquivoCaminho())
            .normalize();

    Resource resource = new UrlResource(filePath.toUri());

    if (!resource.exists()) {
        throw new RuntimeException(
                "Arquivo não encontrado no servidor"
        );
    }

    return resource;
}

    private String salvarArquivo(MultipartFile file, UUID atividadeId, UUID alunoId) throws IOException {
        String subDir = atividadeId.toString() + "/" + alunoId.toString();
        Path uploadPath = Paths.get(uploadDir).resolve(subDir);
        Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf("."))
                : "";
        String storedName = UUID.randomUUID() + extension;

        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        return subDir + "/" + storedName;
    }
}
