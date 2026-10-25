import React, { Component } from 'react'
import Navbar from '../navbar/Navbar';
import '../../assets/css/tcc.css';
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';
import { Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { TCCService } from '../../service/TCCService';
import { CategoriaService } from '../../service/CategoriaService';
import { SubcategoriaService } from '../../service/SubcategoriaService';
import { OrientadorService } from '../../service/OrientadorService';
import { CursoService } from '../../service/CursoService';

//const defaultSelectOption = { value: '', label: 'Selecione...', isDisabled: true };

class MeuTCC extends Component {
  
    state = {
        tccExistente: false,
        editandoTcc: false,
        tccOriginal: {},
        resumo: '',
        tituloTcc: '',
        curso: '',
        aluno: '',
        orientador: '',
        selectedCategoria: '',
        selectedSubcategoria: '',
        selectedKeywords: '',
        changesMade: false,
        optionsCategorias: [],
        optionsSubcategorias: [],
        optionsKeywords: []
    }

    tccService = new TCCService();
    categoriaService = new CategoriaService();
    subcategoriaService = new SubcategoriaService();
    orientadorService = new OrientadorService();
    cursoService = new CursoService();

    handleChange = (event) => {
        this.setState({ changesMade: true });
        this.setState({ [event.target.name]: event.target.value });
    };

    handleChangeSelect = (option, elementName) => {
    if (elementName === 'selectedCurso') {
        this.setState({
            selectedCurso: option,
            selectedOrientador: null,
            changesMade: true
        });
        return;
    }

    if (elementName === 'selectedCategoria') {
        this.setState({
            selectedCategoria: option,
            selectedSubcategoria: null,
            optionsSubcategorias: [],
            changesMade: true
        });

        if (option) {
            this.fillOptionsSubcategorias(option.value);
        }
        return;
    }

    this.setState({
        [elementName]: option,
        changesMade: true
    });
}

    fillList = () => {
        this.tccService.listAll()
            .then((response) => this.setState({tccs: response.data, filteredItems: response.data}))
            .catch((error) => {
                toast.error('Erro ao carregar os dados', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
            });
    }

    fillOptionsCategorias = () => {
        this.categoriaService.listAll()
            .then((response) => {
                const optionsCategorias = response.data.map(categoria => ({
                    value: categoria.id,
                    label: categoria.nomeCategoria
                }));
                this.setState({ optionsCategorias });
            });
    }

    fillOptionsOrientadores = () => {
    this.orientadorService.listAll()
        .then((response) => {
            const orientadores = response.data;

            const optionsOrientadores = orientadores.map(orientador => ({
                value: orientador.id,
                label: orientador.nomeCompleto,
                atuaEmTodosCursos: orientador.atuaEmTodosCursos,
                cursosIds: orientador.cursosIds || []
            }));

            this.setState({
                optionsOrientadores
            });
        })
        .catch((error) => {
            console.error('Erro ao carregar orientadores:', error);
        });
}

fillOptionsCursos = () => {
    this.cursoService.listAll()
        .then((response) => {
            const optionsCursos = response.data.map(curso => ({
                value: curso.id,
                label: curso.nome
            }));

            this.setState({ optionsCursos });
        });
}

    fillOptionsSubcategorias = (categoria) => {
        this.subcategoriaService.findAllByCategoria(categoria)
            .then((response) => {
                if(response.status !== 200){ throw new Error('Erro na requisição: ' + response.status); }
                
                const optionsSubcategorias = response.data.map(subcategoria => ({
                    value: subcategoria.id,
                    label: subcategoria.nomeSubcategoria
                }));
                this.setState({ optionsSubcategorias });
                return;
            })
            .catch((error) => { });
    }

    validateForm = () => {
        const { tituloTcc, selectedAluno, selectedCurso, selectedOrientador } = this.state;
        if (!tituloTcc || !selectedAluno || !selectedCurso || !selectedOrientador) {
            if (!selectedAluno) this.setState({ isAlunoInvalid: true });
            if (!selectedCurso) this.setState({ isCursoInvalid: true });
            if (!selectedOrientador) this.setState({ isOrientadorInvalid: true });
            return false;
        }

        return true;
    }

    clearState = () => {
        this.setState({
            tccExistente: false,
            resumo: '',
            tituloTcc: '',
            curso: '',
            aluno: '',
            orientador: '',
            status: '',
            selectedCategoria: '',
            selectedSubcategoria: '',
            selectedKeywords: '',
            changesMade: false,
            optionsCategorias: [],
            optionsSubcategorias: [],
            optionsKeywords: [],
            optionsOrientadores: [],
            selectedOrientador: '',
            optionsCursos: [],
            selectedCurso: '',
        });
    }

    revertFields = () => {
        this.setState({
            tituloTcc: this.state.tccOriginal.titulo,
            resumo: this.state.tccOriginal.resumo || '',
            selectedCategoria: this.state.tccOriginal.categoria,
            selectedSubcategoria: this.state.tccOriginal.subcategoria,
            selectedKeywords: this.state.tccOriginal.keywords,
            changesMade: false
        });
    }

    submitTCCForm = (event) => {
        event.preventDefault();

        const { tituloTcc, resumo, selectedSubcategoria, tccOriginal } = this.state;

        if (!tituloTcc.trim() || !resumo.trim() || !selectedSubcategoria?.value) {
            toast.error('Preencha titulo, resumo e subcategoria.');
            return;
        }

        const data = {
            titulo: tituloTcc.trim(),
            resumo: resumo.trim(),
            idSubcategoria: selectedSubcategoria.value
        };

        this.tccService.editarPeloAluno(tccOriginal.id, data)
            .then((response) => {
                if (response.status !== 200) {
                    throw new Error('Erro na requisicao: ' + response.status);
                }

                toast.success('TCC atualizado sem alterar as aprovacoes!');
                this.setState({ editandoTcc: false });
                this.getMyTcc();
            })
            .catch((error) => {
                console.error('Erro ao atualizar TCC:', error);
                toast.error('Erro ao salvar as alteracoes do TCC.');
            });
    }
    submitPropostaForm = (event) => {
    event.preventDefault();

    let data = {
        titulo: this.state.tituloTcc,
        resumo: this.state.resumo,
        idOrientador: this.state.selectedOrientador.value,
        idCurso: this.state.selectedCurso.value,
    idSubcategoria: this.state.selectedSubcategoria.value
    };

    this.tccService.criarProposta(data)
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Erro na requisição: ' + response.status);
            }

            toast.success('Proposta enviada ao orientador!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            this.clearState();
            this.getMyTcc();
        })
        .catch(error => {
            toast.error('Erro ao enviar proposta', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        });
}

        carregarClassificacaoTcc = async (idCategoria, idSubcategoria) => {
        if (!idCategoria || !idSubcategoria) {
            this.setState({
                selectedCategoria: null,
                selectedSubcategoria: null,
                optionsSubcategorias: []
            });
            return;
        }

        try {
            const [categoriasResponse, subcategoriasResponse] = await Promise.all([
                this.categoriaService.listAll(),
                this.subcategoriaService.findAllByCategoria(idCategoria)
            ]);

            const optionsCategorias = categoriasResponse.data.map(categoria => ({
                value: categoria.id,
                label: categoria.nomeCategoria
            }));

            const optionsSubcategorias = subcategoriasResponse.data.map(subcategoria => ({
                value: subcategoria.id,
                label: subcategoria.nomeSubcategoria
            }));

            this.setState({
                optionsCategorias,
                optionsSubcategorias,
                selectedCategoria: optionsCategorias.find(
                    categoria => categoria.value === idCategoria
                ) || null,
                selectedSubcategoria: optionsSubcategorias.find(
                    subcategoria => subcategoria.value === idSubcategoria
                ) || null
            });
        } catch (error) {
            console.error('Erro ao carregar categoria e subcategoria:', error);
            toast.error('Erro ao carregar a classificacao do TCC.');
        }
    }

    getMyTcc = () => {
        //Método ainda não implementado no backend  

        this.tccService.getMyTcc()
            .then((response) => {
                console.log('MEU TCC RECEBIDO:', response.data);
                this.setState({
                    tccExistente: true,
                    tccOriginal: response.data,
                    tituloTcc: response.data.titulo,
                    resumo: response.data.resumo || '',
                    curso: response.data.nomeCurso,
                    aluno: response.data.nomeCompletoAluno,
                    orientador: response.data.nomeCompletoOrientador,
                    status: response.data.status,
                    selectedCategoria: null,
                    selectedSubcategoria: null,
                    keywords: response.data.keywords
                });
                this.carregarClassificacaoTcc(response.data.idCategoria, response.data.idSubcategoria);
            })
            .catch((error) => {
    if (error.response?.status === 404) {
        this.setState({ tccExistente: false });
        return;
    }
                toast.error('Erro ao carregar os dados', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    });
            });
    }

    componentDidMount() {
    this.getMyTcc();
    this.fillOptionsCategorias();
    this.fillOptionsOrientadores();
    this.fillOptionsCursos();
    }

    renderFormularioEdicao = () => (
        <div className="bg-white rounded shadow-sm col-12 col-md-8 col-lg-6 m-auto p-4">
            <h4 className="fw-bold mb-3">Editar TCC</h4>

            <p className="text-muted">
                Atualize os dados da sua proposta. O status das aprovacoes
                sera preservado.
            </p>

            <form onSubmit={this.submitTCCForm}>
                <div className="mb-3">
                    <label className="form-label fw-bold">
                        Titulo do TCC
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="tituloTcc"
                        value={this.state.tituloTcc}
                        onChange={this.handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">
                        Resumo
                    </label>
                    <textarea
                        className="form-control"
                        name="resumo"
                        value={this.state.resumo}
                        onChange={this.handleChange}
                        rows="5"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">
                        Categoria
                    </label>
                    <Select
                        options={this.state.optionsCategorias || []}
                        value={this.state.selectedCategoria || null}
                        onChange={(option) =>
                            this.handleChangeSelect(option, 'selectedCategoria')
                        }
                        placeholder="Selecione uma categoria"
                        isClearable={false}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">
                        Subcategoria
                    </label>
                    <Select
                        options={this.state.optionsSubcategorias || []}
                        value={this.state.selectedSubcategoria || null}
                        onChange={(option) =>
                            this.handleChangeSelect(option, 'selectedSubcategoria')
                        }
                        placeholder={
                            this.state.selectedCategoria
                                ? "Selecione uma subcategoria"
                                : "Selecione primeiro a categoria"
                        }
                        isDisabled={!this.state.selectedCategoria}
                        isClearable={false}
                    />
                </div>

                <div className="mb-3">
                    <strong>Curso:</strong> {this.state.curso}
                </div>

                <div className="mb-3">
                    <strong>Orientador:</strong> {this.state.orientador}
                </div>

                <div className="d-flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="btn btn-primary flex-fill"
                        disabled={
                            !this.state.tituloTcc.trim() ||
                            !this.state.resumo.trim() ||
                            !this.state.selectedCategoria?.value ||
                            !this.state.selectedSubcategoria?.value
                        }
                    >
                        Salvar alteracoes
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => this.setState({ editandoTcc: false })}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
    render() {

        let document = 'null';

        if (this.state.tccExistente && this.state.editandoTcc) {
        document = this.renderFormularioEdicao();
    } else if (!this.state.tccExistente) {
    document = (
        <div className="bg-white rounded shadow-sm col-12 col-md-8 col-lg-6 m-auto p-4">
            <h4 className="fw-bold mb-3">Cadastrar proposta de TCC</h4>

            <p className="text-muted">
                Preencha os dados da sua proposta e escolha um professor orientador.
            </p>
            <form onSubmit={this.submitPropostaForm}>

    <div className="mb-3">
        <label className="form-label fw-bold">
            Título do TCC
        </label>
        <input
            type="text"
            className="form-control"
            name="tituloTcc"
            value={this.state.tituloTcc}
            onChange={this.handleChange}
            placeholder="Digite o título da proposta"
            required
        />
    </div>

    <div className="mb-3">
        <label className="form-label fw-bold">
            Resumo
        </label>
        <textarea
            className="form-control"
            name="resumo"
            value={this.state.resumo}
            onChange={this.handleChange}
            rows="4"
            placeholder="Descreva brevemente sua proposta"
            required
        />
    </div>

    <div className="mb-3">
        <label className="form-label fw-bold">
            Curso
        </label>
        <Select
            options={this.state.optionsCursos || []}
            value={this.state.selectedCurso || null}
            onChange={(option) =>
                this.handleChangeSelect(option, 'selectedCurso')
            }
            placeholder="Selecione seu curso"
            isClearable={false}
            required
        />
    </div>

    <div className="mb-3">
        <label className="form-label fw-bold">Categoria</label>
        <Select
            options={this.state.optionsCategorias || []}
            value={this.state.selectedCategoria || null}
            onChange={(option) =>
                this.handleChangeSelect(option, 'selectedCategoria')
            }
            placeholder="Selecione uma categoria"
            isClearable={false}
            required
        />
    </div>

    <div className="mb-3">
        <label className="form-label fw-bold">Subcategoria</label>
        <Select
            options={this.state.optionsSubcategorias || []}
            value={this.state.selectedSubcategoria || null}
            onChange={(option) =>
                this.handleChangeSelect(option, 'selectedSubcategoria')
            }
            placeholder={
                this.state.selectedCategoria
                    ? "Selecione uma subcategoria"
                    : "Selecione primeiro a categoria"
            }
            isDisabled={!this.state.selectedCategoria}
            isClearable={false}
            required
        />
    </div>
    <div className="mb-3">
        <label className="form-label fw-bold">
            Professor orientador
        </label>
        <Select
    options={(this.state.optionsOrientadores || []).filter(orientador =>
        this.state.selectedCurso?.value &&
        (
            orientador.atuaEmTodosCursos ||
            orientador.cursosIds.includes(this.state.selectedCurso.value)
        )
    )}
    value={this.state.selectedOrientador || null}
    onChange={(option) =>
        this.handleChangeSelect(option, 'selectedOrientador')
    }
    placeholder={
        this.state.selectedCurso
            ? "Selecione um orientador"
            : "Selecione primeiro o curso"
    }
    isDisabled={!this.state.selectedCurso}
    isClearable={false}
    required
/>
    </div>

    <button
        type="submit"
        className="btn btn-primary w-100 mt-3"
        disabled={
            !this.state.tituloTcc.trim() ||
            !this.state.resumo.trim() ||
            !this.state.selectedCurso?.value ||
            !this.state.selectedOrientador?.value ||
        !this.state.selectedCategoria?.value ||
        !this.state.selectedSubcategoria?.value
        }
    >
        Enviar proposta de TCC
    </button>

</form>
        </div>
    );
} else if (
    this.state.status === 'PROPOSTA_APROVADA'
) {
    document = <>
        <div className="bg-white rounded shadow-sm col-12 col-md-8 col-lg-6 m-auto p-4">
            <div className="text-center mb-4">
                <i className="bi bi-check-circle-fill display-4 text-success"></i>
                <h4 className="mt-3">Proposta de TCC aprovada</h4>
            </div>

            <div className="mb-3">
                <strong>Título:</strong> {this.state.tituloTcc}
            </div>

            <div className="mb-3">
                <strong>Curso:</strong> {this.state.curso}
            </div>

            <div className="mb-3">
                <strong>Autor:</strong> {this.state.aluno}
            </div>

            <div className="mb-3">
                <strong>Orientador:</strong> {this.state.orientador}
            </div>

            <div className="mb-3">
                <strong>Status:</strong>{' '}
                <span className="text-success fw-bold">
                    Proposta Aprovada
                </span>
            </div>

            <div className="alert alert-success mt-4 mb-0">
                Sua proposta foi aprovada pelo orientador e pelo coordenador.
            </div>
            <button
                type="button"
                className="btn btn-primary w-100 mt-3"
                onClick={() => this.setState({ editandoTcc: true })}
            >
                <i className="bi bi-pencil-square me-2"></i>
                Editar TCC
            </button>
        </div>
    </>
} else {
    document = <>
        <div className="bg-white rounded shadow-sm col-12 col-md-8 col-lg-6 m-auto p-4">
            <div className="text-center mb-4">
                <i className="bi bi-hourglass-split display-4 text-info"></i>
                <h4 className="mt-3">Proposta de TCC enviada</h4>
            </div>

            <div className="mb-3">
                <strong>Título:</strong> {this.state.tituloTcc}
            </div>

            <div className="mb-3">
                <strong>Curso:</strong> {this.state.curso}
            </div>

            <div className="mb-3">
                <strong>Orientador:</strong> {this.state.orientador}
            </div>

            <div className="mb-3">
                <strong>Status:</strong>{' '}
                {this.state.status === 'AGUARDANDO_ORIENTADOR'
                    ? 'Aguardando aprovação do orientador'
                    : 'Aguardando aprovação do coordenador'}
            </div>

            <div className="alert alert-info mt-4 mb-0">
                Sua proposta foi enviada e está em processo de aprovação.
            </div>
            <button
                type="button"
                className="btn btn-primary w-100 mt-3"
                onClick={() => this.setState({ editandoTcc: true })}
            >
                <i className="bi bi-pencil-square me-2"></i>
                Editar TCC
            </button>
        </div>
    </>
}

return (
    <div className="tcc-page bg-light min-vh-100">
        <Navbar />
        <ToastContainer/>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='page-content container-fluid px-4'
        >
            <div className="row mb-4 mt-4">
                <div className="col-12">
                    <h1 className='display-5 fw-bold mb-4 tittle tittleAfter'>
                        Meu TCC
                    </h1>
                </div>
            </div>

            <div className='px-4'>
                {document}
            </div>
        </motion.div>
    </div>
)
}
}

export default MeuTCC;
