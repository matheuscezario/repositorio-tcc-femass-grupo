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
        this.setState({ changesMade: true });
        if(elementName.startsWith('selectedCategoria')) this.fillOptionsSubcategorias(option.value);
        this.setState({ [elementName]: option });
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
            const optionsOrientadores = response.data.map(orientador => ({
                value: orientador.id,
                label: orientador.nomeCompleto
            }));

            this.setState({ optionsOrientadores });
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
        
        let data = {
            "titulo": this.state.tituloTcc,
            "resumo": this.state.resumo,
            "id": this.state.tccOriginal.id,
            "idAluno": this.state.tccOriginal.idAluno,
            "idOrientador": this.state.tccOriginal.idOrientador,
            "idCurso": this.state.tccOriginal.idCurso
        }

        if(this.state.selectedCategoria && this.state.selectedCategoria.value) {data.categoria = this.state.selectedCategoria.value;}
        if(this.state.selectedSubcategoria && this.state.selectedSubcategoria.value) {data.subcategoria = this.state.selectedSubcategoria.value;}
        if(this.state.selectedKeywords && this.state.selectedKeywords.length > 0) {data.keywords = this.state.selectedKeywords.map(keyword => keyword.value);}

        this.tccService.update(this.state.tccOriginal.id, data)
        .then(response => {
            if(response.status !== 200){ throw new Error('Erro na requisição: ' + response.status); }
            toast.success('TCC atualizado!', {
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
            toast.error('Erro ao salvar', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            // Lógica para lidar com o erro
        });
    }

    submitPropostaForm = (event) => {
    event.preventDefault();

    let data = {
        titulo: this.state.tituloTcc,
        resumo: this.state.resumo,
        idOrientador: this.state.selectedOrientador.value,
        idCurso: this.state.selectedCurso.value
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
                    selectedCategoria: response.data.categoria,
                    selectedSubcategoria: response.data.subcategoria,
                    keywords: response.data.keywords
                });
            })
            .catch((error) => {
                if(error.response.status === 404) {
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

    render() {

        let document = 'null';

        if (
    this.state.tccExistente &&
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
