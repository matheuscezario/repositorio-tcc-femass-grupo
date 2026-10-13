package com.example.repositorioDeTcc.service;

import com.example.repositorioDeTcc.dto.TCCDTO;
import com.example.repositorioDeTcc.dto.TCCMinDTO;
import com.example.repositorioDeTcc.dto.TCCUpdateDTO;
import com.example.repositorioDeTcc.exception.MatriculaNotFoundException;
import com.example.repositorioDeTcc.exception.ResourceNotFoundException;
import com.example.repositorioDeTcc.exception.TCCNotFoundException;
import com.example.repositorioDeTcc.exception.handler.RequiredObjectIsNullException;
import com.example.repositorioDeTcc.mapper.TCCMapper;
import com.example.repositorioDeTcc.model.PalavraChave;
import com.example.repositorioDeTcc.model.Subcategoria;
import com.example.repositorioDeTcc.model.StatusTCC;
import com.example.repositorioDeTcc.model.Aluno;
import com.example.repositorioDeTcc.model.TCC;
import com.example.repositorioDeTcc.model.User;
import com.example.repositorioDeTcc.repository.AlunoRepository;
import com.example.repositorioDeTcc.repository.CategoriaRepository;
import com.example.repositorioDeTcc.repository.CoordenadorRepository;
import com.example.repositorioDeTcc.repository.OrientadorRepository;
import com.example.repositorioDeTcc.repository.PalavraChaveRepository;
import com.example.repositorioDeTcc.repository.SubcategoriaRepository;
import com.example.repositorioDeTcc.repository.TCCRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.repositorioDeTcc.repository.ProfessorTCCRepository;

import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class TCCService {

    @Autowired
private PerfilUsuarioService perfilUsuarioService;

    @Autowired
    AlunoRepository alunoRepository;

    @Autowired
    OrientadorRepository orientadorRepository;

    @Autowired
private ProfessorTCCRepository professorRepository;

    @Autowired
CoordenadorRepository coordenadorRepository;
    
    @Autowired
    SubcategoriaRepository subcategoriaRepository;

    @Autowired
    TCCRepository repository;

    @Autowired
    TCCMapper tccMapper;
    
    @Autowired
    PalavraChaveRepository palavraChaveRepository;

    @Transactional(readOnly = true)
public TCCDTO findById(UUID id) {

    var authentication = org.springframework.security.core.context
            .SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null
        || !(authentication.getPrincipal() instanceof User usuario)) {
    throw new org.springframework.security.access.AccessDeniedException(
            "Usuário não autenticado."
    );
}

    TCC tcc = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(id));

    boolean proprioAluno =
            usuario.getMatricula() != null
            && tcc.getAluno() != null
            && usuario.getMatricula().equals(tcc.getAluno().getMatricula());

    boolean orientadorResponsavel =
            usuario.getEmail() != null
            && tcc.getOrientador() != null
            && tcc.getOrientador().getEmail() != null
            && usuario.getEmail().equalsIgnoreCase(
                    tcc.getOrientador().getEmail()
            );

    boolean coordenadorResponsavel = false;

    if (usuario.getEmail() != null && tcc.getCurso() != null) {

        var coordenador = coordenadorRepository.findByEmail(
                usuario.getEmail()
        );

        coordenadorResponsavel =
                coordenador.isPresent()
                && coordenador.get().getCurso() != null
                && coordenador.get().getCurso().getId().equals(
                        tcc.getCurso().getId()
                );
    }

    boolean professorDaTurma = professorPodeVisualizarTcc(usuario, tcc);

if (!proprioAluno
        && !orientadorResponsavel
        && !coordenadorResponsavel
        && !professorDaTurma) {

    throw new org.springframework.security.access.AccessDeniedException(
            "Você não possui permissão para visualizar esta proposta."
    );
}

    return new TCCDTO(tcc);
}

    @Transactional(readOnly = true)
    public List<TCCMinDTO> findAll(){
        List <TCC> list = repository.findAll();
        List<TCCMinDTO> listDto = list.stream().map(tcc -> new TCCMinDTO(tcc)).toList();
        return listDto;
    }

    @Transactional(readOnly = true)
    public TCCDTO findMine(Principal connectedUser){
        User user = (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();
        String matricula = user.getMatricula();
        if(matricula == null) throw new MatriculaNotFoundException();
        TCC tcc = repository.findByAlunoMatricula(matricula);
        if(tcc == null) throw new TCCNotFoundException();
        TCCDTO dto = new TCCDTO(tcc);
        return dto;
    }

    @Transactional
    public TCCDTO insert(TCCDTO tccDTO){
        if(tccDTO == null) throw new RequiredObjectIsNullException();
        TCC tcc = tccMapper.fromTCCDTOToTCC(tccDTO);
        
        // Salva o TCC primeiro
        TCC savedTcc = repository.save(tcc);
        
        // Se tiver palavras-chave, atualiza as associações
        if(tccDTO.getPalavrasChave() != null && !tccDTO.getPalavrasChave().isEmpty()) {
            Set<PalavraChave> palavras = new HashSet<>();
            for(var palavraDTO : tccDTO.getPalavrasChave()) {
                PalavraChave palavraChave = null;
                
                // Se a palavra-chave tem ID válido, busca no banco
                if(palavraDTO.getId() != null) {
                    palavraChave = palavraChaveRepository.findById(palavraDTO.getId()).orElse(null);
                } 
                
                // Se não encontrou ou não tem ID, verifica se tem nome para criar nova
                if(palavraChave == null && palavraDTO.getNome() != null && !palavraDTO.getNome().isEmpty()) {
                    // Verifica se já existe uma palavra-chave com este nome
                    palavraChave = palavraChaveRepository.findByNome(palavraDTO.getNome()).orElse(null);
                    
                    // Se não existe, cria uma nova
                    if(palavraChave == null) {
                        palavraChave = new PalavraChave(palavraDTO.getNome());
                        palavraChave = palavraChaveRepository.save(palavraChave);
                    }
                }
                
                if(palavraChave != null) {
                    palavras.add(palavraChave);
                }
            }
            savedTcc.setPalavrasChave(palavras);
            savedTcc = repository.save(savedTcc);
        }
        
        return tccMapper.toTCCDTO(savedTcc);
    }

    @Transactional
public TCCDTO criarProposta(TCCDTO tccDTO, Principal connectedUser) {
    if (tccDTO == null) {
        throw new RequiredObjectIsNullException();
    }

    User user = (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();

    String matricula = user.getMatricula();

    if (matricula == null) {
        throw new MatriculaNotFoundException();
    }

    Aluno aluno = alunoRepository.findByMatricula(matricula)
            .orElseThrow(() -> new MatriculaNotFoundException());
    TCC tccExistente = repository.findByAlunoMatricula(matricula);

if (tccExistente != null) {
    throw new IllegalStateException(
        "Você já possui uma proposta de TCC cadastrada."
    );
}
tccDTO.setIdAluno(aluno.getId());
    tccDTO.setStatus(StatusTCC.AGUARDANDO_ORIENTADOR);

    if (tccDTO.getIdCurso() == null || tccDTO.getIdOrientador() == null) {
    throw new IllegalArgumentException(
        "Curso e orientador são obrigatórios."
    );
}

var orientador = orientadorRepository
        .findById(tccDTO.getIdOrientador())
        .orElseThrow(() -> new ResourceNotFoundException(
            tccDTO.getIdOrientador()
        ));

boolean orientadorPermitido =
        orientador.isAtuaEmTodosCursos()
        || orientador.getCursos().stream()
            .anyMatch(curso ->
                curso.getId().equals(tccDTO.getIdCurso())
            );

if (!orientadorPermitido) {
    throw new IllegalArgumentException(
        "O orientador selecionado não está vinculado ao curso informado."
    );
}

    return insert(tccDTO);
}

    public void delete(UUID id){
        if(!repository.existsById(id)) throw new ResourceNotFoundException(id);

        repository.deleteById(id);
    }

    @Transactional
    public TCCDTO update(UUID id, TCCUpdateDTO obj){
        if(!repository.existsById(id)) throw new ResourceNotFoundException(id);

        TCC entity = repository.getReferenceById(id);
        updateData(entity, obj);
        return tccMapper.toTCCDTO(repository.save(entity));
    }

    private void updateData(TCC entity, TCCUpdateDTO obj) {
        entity.setResumo(obj.getResumo());
        entity.setTitulo(obj.getTitulo());
        entity.setOrientador(orientadorRepository.findById(obj.getIdOrientador()).orElseThrow(() -> new ResourceNotFoundException(obj.getIdOrientador())));
        Subcategoria subcategoria = obj.getIdSubcategoria() != null ? subcategoriaRepository.findById(obj.getIdSubcategoria()).orElseThrow(()-> new ResourceNotFoundException(obj.getIdSubcategoria())) : null;
        entity.setSubcategoria(subcategoria);
        
        // Limpa as palavras-chave existentes
        entity.getPalavrasChave().clear();
        
        // Adiciona palavras-chave existentes por ID
        if(obj.getIdPalavrasChave() != null && !obj.getIdPalavrasChave().isEmpty()) {
            for(UUID palavraId : obj.getIdPalavrasChave()) {
                PalavraChave palavra = palavraChaveRepository.findById(palavraId)
                    .orElseThrow(() -> new ResourceNotFoundException(palavraId));
                entity.getPalavrasChave().add(palavra);
            }
        }
        
        // Adiciona palavras-chave novas
        if(obj.getPalavrasChave() != null && !obj.getPalavrasChave().isEmpty()) {
            for(var palavraDTO : obj.getPalavrasChave()) {
                PalavraChave palavraChave = null;
                
                // Se a palavra-chave tem ID, busca no banco
                if(palavraDTO.getId() != null) {
                    palavraChave = palavraChaveRepository.findById(palavraDTO.getId()).orElse(null);
                }
                
                // Se não encontrou ou não tem ID, verifica se tem nome para criar nova
                if(palavraChave == null && palavraDTO.getNome() != null && !palavraDTO.getNome().isEmpty()) {
                    // Verifica se já existe uma palavra-chave com este nome
                    palavraChave = palavraChaveRepository.findByNome(palavraDTO.getNome()).orElse(null);
                    
                    // Se não existe, cria uma nova
                    if(palavraChave == null) {
                        palavraChave = new PalavraChave(palavraDTO.getNome());
                        palavraChave = palavraChaveRepository.save(palavraChave);
                    }
                }
                
                if(palavraChave != null) {
                    entity.getPalavrasChave().add(palavraChave);
                }
            }
        }
    }

    @Transactional(readOnly = true)
public List<TCCMinDTO> findSolicitacoesPendentes() {

    var authentication = org.springframework.security.core.context
            .SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !(authentication.getPrincipal() instanceof User usuario)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "Usuário não autenticado."
        );
    }

    String email = usuario.getEmail();

    var orientador = orientadorRepository.findByEmail(email)
            .filter(o -> o.getUser() != null
                    && usuario.getId().equals(o.getUser().getId()));

    var coordenador = coordenadorRepository.findByEmail(email)
            .filter(c -> c.getUser() != null
                    && usuario.getId().equals(c.getUser().getId()));

    return repository.findAll().stream()
            .filter(tcc -> {

                boolean pendenteOrientador =
                        orientador.isPresent()
                        && tcc.getStatus() == StatusTCC.AGUARDANDO_ORIENTADOR
                        && tcc.getOrientador() != null
                        && orientador.get().getId().equals(
                                tcc.getOrientador().getId()
                        );

                boolean pendenteCoordenador =
                        coordenador.isPresent()
                        && tcc.getStatus() == StatusTCC.AGUARDANDO_COORDENADOR
                        && tcc.getCurso() != null
                        && coordenador.get().getCurso() != null
                        && coordenador.get().getCurso().getId().equals(
                                tcc.getCurso().getId()
                        );

                boolean pendenteProfessor =
                        (tcc.getStatus() == StatusTCC.AGUARDANDO_ORIENTADOR
                        || tcc.getStatus() == StatusTCC.AGUARDANDO_COORDENADOR)
                        && professorPodeVisualizarTcc(usuario, tcc);

                return pendenteOrientador
                        || pendenteCoordenador
                        || pendenteProfessor;
            })
            .map(TCCMinDTO::new)
            .toList();
}

@Transactional(readOnly = true)
public List<TCCMinDTO> findPropostasEmAcompanhamento() {

    var authentication = org.springframework.security.core.context
            .SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !(authentication.getPrincipal() instanceof User usuario)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "Usuário não autenticado."
        );
    }

    var orientador = orientadorRepository.findByEmail(usuario.getEmail())
            .filter(o -> o.getUser() != null
                    && usuario.getId().equals(o.getUser().getId()));

    return repository.findAll().stream()
            .filter(tcc -> {

                if (tcc.getStatus() != StatusTCC.AGUARDANDO_COORDENADOR) {
                    return false;
                }

                boolean orientadorResponsavel =
                        orientador.isPresent()
                        && tcc.getOrientador() != null
                        && orientador.get().getId().equals(
                                tcc.getOrientador().getId()
                        );

                boolean professorDaTurma =
                        professorPodeVisualizarTcc(usuario, tcc);

                return orientadorResponsavel || professorDaTurma;
            })
            .map(TCCMinDTO::new)
            .toList();
}

    @Transactional(readOnly = true)
public List<TCCMinDTO> findPropostasAprovadas() {

    var authentication = org.springframework.security.core.context
            .SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !(authentication.getPrincipal() instanceof User usuario)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "Usuário não autenticado."
        );
    }

    String email = usuario.getEmail();

    var orientador = orientadorRepository.findByEmail(email)
            .filter(o -> o.getUser() != null
                    && usuario.getId().equals(o.getUser().getId()));

    var coordenador = coordenadorRepository.findByEmail(email)
            .filter(c -> c.getUser() != null
                    && usuario.getId().equals(c.getUser().getId()));

    return repository.findAll().stream()
            .filter(tcc -> {

                if (tcc.getStatus() != StatusTCC.PROPOSTA_APROVADA) {
                    return false;
                }

                boolean orientadorResponsavel =
                        orientador.isPresent()
                        && tcc.getOrientador() != null
                        && orientador.get().getId().equals(
                                tcc.getOrientador().getId()
                        );

                boolean coordenadorResponsavel =
                        coordenador.isPresent()
                        && coordenador.get().getCurso() != null
                        && tcc.getCurso() != null
                        && coordenador.get().getCurso().getId().equals(
                                tcc.getCurso().getId()
                        );

                boolean professorDaTurma =
                        professorPodeVisualizarTcc(usuario, tcc);

                return orientadorResponsavel
                        || coordenadorResponsavel
                        || professorDaTurma;
            })
            .map(TCCMinDTO::new)
            .toList();
}

@Transactional
public TCCDTO aprovarPeloOrientador(UUID id) {

    var authentication = org.springframework.security.core.context
            .SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !(authentication.getPrincipal() instanceof User usuario)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "Usuário não autenticado."
        );
    }

    if (!perfilUsuarioService.buscarPerfis(usuario).contains("ORIENTADOR")) {
    throw new org.springframework.security.access.AccessDeniedException(
            "Somente usuários com perfil de orientador podem realizar esta aprovação."
    );
}

    TCC tcc = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(id));

    if (tcc.getStatus() != StatusTCC.AGUARDANDO_ORIENTADOR) {
        throw new IllegalStateException(
                "A proposta não está aguardando aprovação do orientador."
        );
    }

    if (tcc.getOrientador() == null
            || tcc.getOrientador().getEmail() == null
            || !tcc.getOrientador().getEmail()
                    .equalsIgnoreCase(usuario.getEmail())) {

        throw new org.springframework.security.access.AccessDeniedException(
                "Somente o orientador responsável pode aprovar esta proposta."
        );
    }

        tcc.setStatus(StatusTCC.AGUARDANDO_COORDENADOR);

    return new TCCDTO(repository.save(tcc));
}

@Transactional
public TCCDTO aprovarPeloCoordenador(UUID id) {

        var authentication = org.springframework.security.core.context
                .SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof User usuario)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Usuário não autenticado."
            );
        }

        TCC tcc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        if (tcc.getStatus() != StatusTCC.AGUARDANDO_COORDENADOR) {
            throw new IllegalStateException(
                    "A proposta não está aguardando aprovação do coordenador."
            );
        }

        var coordenador = coordenadorRepository.findByEmail(usuario.getEmail())
                .orElseThrow(() ->
                        new org.springframework.security.access.AccessDeniedException(
                                "Usuário não é um coordenador cadastrado."
                        )
                );

                if (coordenador.getUser() == null
        || !usuario.getId().equals(coordenador.getUser().getId())) {

    throw new org.springframework.security.access.AccessDeniedException(
            "O cadastro de coordenador não pertence ao usuário autenticado."
    );
}

        if (coordenador.getCurso() == null
                || tcc.getCurso() == null
                || !coordenador.getCurso().getId().equals(tcc.getCurso().getId())) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "Somente o coordenador responsável pelo curso pode aprovar esta proposta."
            );
        }

        tcc.setStatus(StatusTCC.PROPOSTA_APROVADA);

        return new TCCDTO(repository.save(tcc));
    }

    private boolean professorPodeVisualizarTcc(User usuario, TCC tcc) {

    if (usuario == null || usuario.getEmail() == null
            || tcc.getAluno() == null
            || tcc.getAluno().getTurma() == null) {
        return false;
    }

    var professor = professorRepository.findByEmail(usuario.getEmail());

if (professor.isEmpty()
        || professor.get().getUser() == null
        || !usuario.getId().equals(professor.get().getUser().getId())) {
    return false;
}

    var turmaAluno = tcc.getAluno().getTurma();

    return professor.get().getTurmas().stream()
            .anyMatch(turma ->
                    turma.getId().equals(turmaAluno.getId())
            );
}

}