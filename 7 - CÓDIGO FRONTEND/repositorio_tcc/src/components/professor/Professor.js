
import React, { Component } from 'react';
import Navbar from '../navbar/Navbar';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import DataTable from 'react-data-table-component';

class Professor extends Component {
    state = {
        listProfessor: [],
        listCursos: [],
        filterText: '',
        nomeCompleto: '',
        cpf: '',
        telefone: '',
        email: '',
        cursosIds: [],
        atuaEmTodosCursos: false,
        toEditItem: null,
        toViewItem: null,
        toDeleteItem: null,
        showModalRegistration: false,
        showModalEdit: false,
        showModalView: false,
        showModalDeletion: false,
        showModalUpload: false,
        uploadFile: null,
        uploading: false,
        saving: false
    };

    headers = () => ({
        Authorization: 'Bearer ' + sessionStorage.getItem('token')
    });

    async request(url, options = {}) {
        const response = await fetch(window.server + url, {
            ...options,
            headers: {
                ...this.headers(),
                ...(options.headers || {})
            }
        });

        if (!response.ok) {
            const message = await response.text().catch(() => '');
            throw new Error(message || `Erro HTTP ${response.status}`);
        }

        if (response.status === 204) return null;

        const contentType = response.headers.get('content-type') || '';

        return contentType.includes('application/json')
            ? response.json()
            : response.text();
    }

    componentDidMount() {
        this.fillList();
        this.fillCursos();
    }

    fillList = async () => {
        try {
            const data = await this.request('/professores');

            this.setState({
                listProfessor: Array.isArray(data) ? data : []
            });
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível carregar os professores.');
        }
    };

    fillCursos = async () => {
        try {
            const data = await this.request('/cursos');

            this.setState({
                listCursos: Array.isArray(data) ? data : []
            });
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível carregar os cursos.');
        }
    };

    resetForm = () => ({
        nomeCompleto: '',
        cpf: '',
        telefone: '',
        email: '',
        cursosIds: [],
        atuaEmTodosCursos: false,
        toEditItem: null
    });

    openRegistration = () => this.setState({
        ...this.resetForm(),
        showModalRegistration: true
    });

    openUpload = () => this.setState({
        showModalUpload: true,
        uploadFile: null,
        cursosIds: [],
        atuaEmTodosCursos: false
    });

    closeModal = (name) => this.setState({
        [`showModal${name}`]: false,
        ...((name === 'Registration' || name === 'Edit')
            ? this.resetForm()
            : {})
    });

    beginEdit = async (professor) => {
        try {
            const data = await this.request(
                '/professores/' + professor.id
            );

            this.setState({
                toEditItem: data,
                showModalEdit: true,
                nomeCompleto: data.nomeCompleto || '',
                cpf: data.cpf || '',
                telefone: data.telefone || '',
                email: data.email || '',
                cursosIds: data.cursosIds || [],
                atuaEmTodosCursos: !!data.atuaEmTodosCursos
            });
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível abrir a edição.');
        }
    };

    beginView = async (professor) => {
        try {
            const data = await this.request(
                '/professores/' + professor.id
            );

            this.setState({
                toViewItem: data,
                showModalView: true
            });
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível visualizar o professor.');
        }
    };

    beginDeletion = (professor) => this.setState({
        toDeleteItem: professor,
        showModalDeletion: true
    });

    deleteProfessor = async () => {
        try {
            await this.request(
                '/professores/' + this.state.toDeleteItem.id,
                { method: 'DELETE' }
            );

            this.setState({
                showModalDeletion: false,
                toDeleteItem: null
            });

            toast.success('Professor excluído!');
            this.fillList();
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível excluir o professor.');
        }
    };

    saveProfessor = async (event) => {
        event.preventDefault();

        const {
            nomeCompleto,
            cpf,
            telefone,
            email,
            cursosIds,
            atuaEmTodosCursos,
            toEditItem
        } = this.state;

        if (!atuaEmTodosCursos && cursosIds.length === 0) {
            toast.warning('Selecione pelo menos um curso.');
            return;
        }

        const payload = {
            nomeCompleto: nomeCompleto.trim(),
            cpf: cpf.replace(/\D/g, ''),
            telefone: telefone.replace(/\D/g, ''),
            email: email.trim(),
            atuaEmTodosCursos,
            cursosIds: atuaEmTodosCursos ? [] : cursosIds
        };

        this.setState({ saving: true });

        try {
            await this.request(
                '/professores' +
                (toEditItem ? '/' + toEditItem.id : ''),
                {
                    method: toEditItem ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            this.setState({
                ...this.resetForm(),
                showModalEdit: false,
                showModalRegistration: false
            });

            toast.success(
                toEditItem
                    ? 'Professor atualizado!'
                    : 'Professor criado!'
            );

            this.fillList();
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível salvar o professor.');
        } finally {
            this.setState({ saving: false });
        }
    };

    importarProfessores = async (event) => {
        event.preventDefault();

        const {
            uploadFile,
            cursosIds,
            atuaEmTodosCursos
        } = this.state;

        if (!uploadFile) {
            toast.warning('Selecione um arquivo.');
            return;
        }

        if (!atuaEmTodosCursos && cursosIds.length === 0) {
            toast.warning('Selecione pelo menos um curso.');
            return;
        }

        const formData = new FormData();

        formData.append('file', uploadFile);
        formData.append(
            'atuaEmTodosCursos',
            String(atuaEmTodosCursos)
        );

        if (!atuaEmTodosCursos) {
            cursosIds.forEach(id =>
                formData.append('cursosIds', id)
            );
        }

        this.setState({ uploading: true });

        try {
            const quantidade = await this.request(
                '/professores/import',
                {
                    method: 'POST',
                    body: formData
                }
            );

            toast.success(
                `${quantidade} novo(s) professor(es) importado(s)!`
            );

            this.setState({
                showModalUpload: false,
                uploadFile: null,
                cursosIds: [],
                atuaEmTodosCursos: false
            });

            this.fillList();
        } catch (error) {
            console.error(error);
            toast.error(
                'Erro ao importar professores. Confira as colunas e o arquivo.'
            );
        } finally {
            this.setState({ uploading: false });
        }
    };

    renderCursos = (prefix) => (
        <div className="mb-3">
            <label className="form-label fw-bold">
                Cursos
            </label>

            <div className="form-check mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${prefix}-todos-cursos`}
                    checked={this.state.atuaEmTodosCursos}
                    onChange={e => this.setState({
                        atuaEmTodosCursos: e.target.checked,
                        cursosIds: []
                    })}
                />

                <label
                    className="form-check-label"
                    htmlFor={`${prefix}-todos-cursos`}
                >
                    Atua em todos os cursos
                </label>
            </div>

            {!this.state.atuaEmTodosCursos && (
                <>
                    <select
                        className="form-select"
                        multiple
                        required
                        value={this.state.cursosIds}
                        onChange={e => this.setState({
                            cursosIds: Array.from(
                                e.target.selectedOptions,
                                option => option.value
                            )
                        })}
                    >
                        {this.state.listCursos.map(curso => (
                            <option
                                key={curso.id}
                                value={curso.id}
                            >
                                {curso.nome}
                            </option>
                        ))}
                    </select>

                    <small className="text-muted">
                        Segure Ctrl para selecionar vários cursos.
                    </small>
                </>
            )}
        </div>
    );

    renderForm = (mode) => (
        <form onSubmit={this.saveProfessor}>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label">
                        Nome Completo *
                    </label>

                    <input
                        className="form-control"
                        required
                        value={this.state.nomeCompleto}
                        onChange={e => this.setState({
                            nomeCompleto: e.target.value
                        })}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        CPF *
                    </label>

                    <input
                        className="form-control"
                        required
                        maxLength={14}
                        value={this.state.cpf}
                        onChange={e => this.setState({
                            cpf: e.target.value
                        })}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        E-mail *
                    </label>

                    <input
                        type="email"
                        className="form-control"
                        required
                        value={this.state.email}
                        onChange={e => this.setState({
                            email: e.target.value
                        })}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Telefone *
                    </label>

                    <input
                        className="form-control"
                        required
                        value={this.state.telefone}
                        onChange={e => this.setState({
                            telefone: e.target.value
                        })}
                    />
                </div>

                {this.renderCursos(mode)}
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    type="button"
                    disabled={this.state.saving}
                    onClick={() => this.closeModal(mode)}
                >
                    Cancelar
                </Button>

                <Button
                    variant={
                        mode === 'Registration'
                            ? 'success'
                            : 'primary'
                    }
                    type="submit"
                    disabled={this.state.saving}
                >
                    {this.state.saving
                        ? 'Salvando...'
                        : mode === 'Registration'
                            ? 'Criar'
                            : 'Salvar'}
                </Button>
            </Modal.Footer>
        </form>
    );

    render() {
        const {
            listProfessor,
            filterText,
            toViewItem,
            toDeleteItem
        } = this.state;

        const filteredData = listProfessor.filter(p =>
            [
                p.nomeCompleto,
                p.cpf,
                p.email,
                p.telefone
            ].some(value =>
                String(value || '')
                    .toLowerCase()
                    .includes(filterText.toLowerCase())
            )
        );

        const columns = [
            {
                name: 'Nome',
                selector: p => p.nomeCompleto,
                sortable: true,
                width: '40%'
            },
            {
                name: 'E-mail',
                selector: p => p.email,
                sortable: true,
                width: '40%'
            },
            {
                name: 'Ações',
                width: '20%',
                cell: p => (
                    <>
                        <button
                            className="btn btn-outline-secondary mx-1 px-1 py-0"
                            title="Visualizar"
                            onClick={() => this.beginView(p)}
                        >
                            <i className="bi bi-eye" />
                        </button>

                        <button
                            className="btn btn-outline-secondary mx-1 px-1 py-0"
                            title="Editar"
                            onClick={() => this.beginEdit(p)}
                        >
                            <i className="bi bi-pencil" />
                        </button>

                        <button
                            className="btn btn-outline-secondary mx-1 px-1 py-0"
                            title="Excluir"
                            onClick={() => this.beginDeletion(p)}
                        >
                            <i className="bi bi-trash" />
                        </button>
                    </>
                )
            }
        ];

        const tableStyle = {
            headCells: {
                style: {
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5em'
                }
            }
        };

        const cursosDescricao = p => {
            if (!p) return '-';

            if (p.atuaEmTodosCursos) {
                return 'Todos os cursos';
            }

            const nomes = (p.cursosIds || []).map(id =>
                this.state.listCursos.find(
                    c => c.id === id
                )?.nome || id
            );

            return nomes.join(', ') || 'Nenhum curso';
        };

        return (
            <div>
                <Navbar />
                <ToastContainer />

                <div className="page-content">
                    <div className="col-12 mb-4 mt-4">
                        <h1 className="display-5 fw-bold mb-4 tittle tittleAfter">
                            Professores
                        </h1>
                    </div>

                    <div className="col-sm-10 col-md-6 col-lg-5 col-xl-4 ms-5">
                        <div
                            className="card mx-3"
                            style={{ maxWidth: '500px' }}
                        >
                            <div className="card-body d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-success fw-bold"
                                    style={{ width: '50%' }}
                                    onClick={this.openRegistration}
                                >
                                    <i className="bi bi-plus-circle-dotted fs-6 me-2" />
                                    Incluir
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary fw-bold"
                                    style={{ width: '50%' }}
                                    onClick={this.openUpload}
                                >
                                    <i className="bi bi-cloud-upload" />
                                    {' '}Carregar arquivo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card mx-5 p-3">
                        <div className="card-body">
                            <div className="table-responsive border-rounded">
                                <DataTable
                                    columns={columns}
                                    data={filteredData}
                                    pagination
                                    customStyles={tableStyle}
                                    responsive
                                    fixedHeader
                                    noDataComponent="Nenhum professor encontrado"
                                    subHeader
                                    subHeaderComponent={
                                        <div className="form-group">
                                            <input
                                                className="form-control"
                                                placeholder="Buscar..."
                                                value={filterText}
                                                onChange={e => this.setState({
                                                    filterText: e.target.value
                                                })}
                                            />
                                        </div>
                                    }
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    show={this.state.showModalRegistration}
                    onHide={() => this.closeModal('Registration')}
                    centered
                >
                    <Modal.Header
                        closeButton
                        className="bg-dark text-white"
                        closeVariant="white"
                    >
                        <Modal.Title>Novo Professor</Modal.Title>
                    </Modal.Header>

                    {this.renderForm('Registration')}
                </Modal>

                <Modal
                    show={this.state.showModalEdit}
                    onHide={() => this.closeModal('Edit')}
                    centered
                >
                    <Modal.Header
                        closeButton
                        className="bg-dark text-white"
                        closeVariant="white"
                    >
                        <Modal.Title>Editar Professor</Modal.Title>
                    </Modal.Header>

                    {this.renderForm('Edit')}
                </Modal>

                <Modal
                    show={this.state.showModalView}
                    onHide={() => this.closeModal('View')}
                    centered
                >
                    <Modal.Header
                        closeButton
                        className="bg-dark text-white"
                        closeVariant="white"
                    >
                        <Modal.Title>Professor</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {toViewItem && (
                            <>
                                <p>
                                    <strong>Nome:</strong>{' '}
                                    {toViewItem.nomeCompleto}
                                </p>

                                <p>
                                    <strong>CPF:</strong>{' '}
                                    {toViewItem.cpf}
                                </p>

                                <p>
                                    <strong>E-mail:</strong>{' '}
                                    {toViewItem.email}
                                </p>

                                <p>
                                    <strong>Telefone:</strong>{' '}
                                    {toViewItem.telefone}
                                </p>

                                <p>
                                    <strong>Cursos:</strong>{' '}
                                    {cursosDescricao(toViewItem)}
                                </p>
                            </>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => this.closeModal('View')}
                        >
                            Fechar
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.showModalDeletion}
                    onHide={() => this.closeModal('Deletion')}
                    centered
                >
                    <Modal.Header
                        closeButton
                        className="bg-dark text-white"
                        closeVariant="white"
                    >
                        <Modal.Title>Confirmar Exclusão</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        Tem certeza que deseja excluir o professor{' '}
                        <strong>{toDeleteItem?.nomeCompleto}</strong>?
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => this.closeModal('Deletion')}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="primary"
                            onClick={this.deleteProfessor}
                        >
                            Confirmar
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={this.state.showModalUpload}
                    onHide={() => this.closeModal('Upload')}
                    centered
                >
                    <Modal.Header
                        closeButton
                        className="bg-dark text-white"
                        closeVariant="white"
                    >
                        <Modal.Title>
                            Importação de Professores
                        </Modal.Title>
                    </Modal.Header>

                    <form onSubmit={this.importarProfessores}>
                        <Modal.Body>
                            {this.renderCursos('upload')}

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Arquivo *
                                </label>

                                <div>
                                    <input
                                        type="file"
                                        id="upload-professores"
                                        style={{ display: 'none' }}
                                        accept=".csv,.xls,.xlsx"
                                        required
                                        onChange={e => this.setState({
                                            uploadFile: e.target.files[0] || null
                                        })}
                                    />

                                    <label
                                        htmlFor="upload-professores"
                                        className="btn btn-outline-secondary"
                                    >
                                        Selecionar arquivo
                                    </label>

                                    <span className="ms-2">
                                        {this.state.uploadFile?.name ||
                                            'Nenhum arquivo selecionado'}
                                    </span>
                                </div>

                                <small className="form-text text-muted">
                                    CSV, XLS, XLSX — colunas: Nome, CPF, E-mail, Celular
                                </small>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                type="button"
                                disabled={this.state.uploading}
                                onClick={() => this.closeModal('Upload')}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="success"
                                type="submit"
                                disabled={
                                    this.state.uploading ||
                                    !this.state.uploadFile ||
                                    (
                                        !this.state.atuaEmTodosCursos &&
                                        !this.state.cursosIds.length
                                    )
                                }
                            >
                                {this.state.uploading
                                    ? 'Importando...'
                                    : 'Carregar'}
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </div>
        );
    }
}

export default Professor;
