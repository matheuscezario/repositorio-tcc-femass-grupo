import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../navbar/Navbar';
import { CategoriaService } from '../../service/CategoriaService';
import { SubcategoriaService } from '../../service/SubcategoriaService';

class Categoria extends Component {
    categoriaService = new CategoriaService();
    subcategoriaService = new SubcategoriaService();

    state = {
        aba: 'categorias',
        categorias: [],
        subcategorias: [],
        carregando: true,
        salvando: false,
        modalAberto: false,
        modalExclusao: false,
        tipo: 'categoria',
        editandoId: null,
        excluindo: null,
        nome: '',
        descricao: '',
        idCategoria: ''
    };

    componentDidMount() {
        this.carregarDados();
    }

    carregarDados = async () => {
        this.setState({ carregando: true });

        try {
            const [categorias, subcategorias] = await Promise.all([
                this.categoriaService.listAll(),
                this.subcategoriaService.listAll()
            ]);

            this.setState({
                categorias: categorias.data || [],
                subcategorias: subcategorias.data || []
            });
        } catch (error) {
            toast.error('Não foi possível carregar categorias e subcategorias.');
        } finally {
            this.setState({ carregando: false });
        }
    };

    abrirCadastro = (tipo) => {
        this.setState({
            tipo,
            editandoId: null,
            nome: '',
            descricao: '',
            idCategoria: '',
            modalAberto: true
        });
    };

    abrirEdicao = (tipo, item) => {
        const categoria = tipo === 'categoria';

        this.setState({
            tipo,
            editandoId: item.id,
            nome: categoria ? item.nomeCategoria : item.nomeSubcategoria,
            descricao: categoria ? item.descricaoCategoria : item.descricaoSubcategoria,
            idCategoria: categoria ? '' : (item.idCategoria || ''),
            modalAberto: true
        });
    };

    salvar = async (event) => {
        event.preventDefault();

        const { tipo, editandoId, nome, descricao, idCategoria } = this.state;

        if (!nome.trim()) {
            toast.warning('Informe o nome.');
            return;
        }

        if (tipo === 'subcategoria' && !idCategoria) {
            toast.warning('Selecione uma categoria.');
            return;
        }

        const dados = tipo === 'categoria'
            ? {
                nomeCategoria: nome.trim(),
                descricaoCategoria: descricao.trim()
            }
            : {
                nomeSubcategoria: nome.trim(),
                descricaoSubcategoria: descricao.trim(),
                idCategoria
            };

        const servico = tipo === 'categoria'
            ? this.categoriaService
            : this.subcategoriaService;

        this.setState({ salvando: true });

        try {
            if (editandoId) {
                await servico.update(editandoId, dados);
            } else {
                await servico.insert(dados);
            }

            toast.success('Registro salvo com sucesso!');
            this.setState({ modalAberto: false });
            await this.carregarDados();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Não foi possível salvar o registro.'
            );
        } finally {
            this.setState({ salvando: false });
        }
    };

    confirmarExclusao = (tipo, item) => {
        this.setState({
            tipo,
            excluindo: item,
            modalExclusao: true
        });
    };

    excluir = async () => {
        const { tipo, excluindo } = this.state;

        if (!excluindo) return;

        const servico = tipo === 'categoria'
            ? this.categoriaService
            : this.subcategoriaService;

        this.setState({ salvando: true });

        try {
            await servico.delete(excluindo.id);
            toast.success('Registro excluído com sucesso!');
            this.setState({
                modalExclusao: false,
                excluindo: null
            });
            await this.carregarDados();
        } catch (error) {
            toast.error(
                'Não foi possível excluir. Verifique se o registro está vinculado a outro cadastro.'
            );
        } finally {
            this.setState({ salvando: false });
        }
    };

    nomeCategoria = (id) => {
        const categoria = this.state.categorias.find(item => item.id === id);
        return categoria ? categoria.nomeCategoria : 'Categoria não encontrada';
    };

    render() {
        const perfis = (() => {
            try {
                const valor = JSON.parse(sessionStorage.getItem('perfis') || '[]');
                return Array.isArray(valor) ? valor : [];
            } catch {
                return [];
            }
        })();

        const role = sessionStorage.getItem('role');

        if (role !== 'COORDENADOR' && !perfis.includes('COORDENADOR')) {
            return <Navigate to="/home" replace />;
        }

        const {
            aba, categorias, subcategorias, carregando,
            salvando, modalAberto, modalExclusao, tipo,
            editandoId, nome, descricao, idCategoria, excluindo
        } = this.state;

        const mostrandoCategorias = aba === 'categorias';
        const itens = mostrandoCategorias ? categorias : subcategorias;
        const tipoAtual = mostrandoCategorias ? 'categoria' : 'subcategoria';

        return (
            <div className="bg-light min-vh-100">
                <Navbar />
                <ToastContainer />

                <div className="page-content container-fluid px-4 py-4">
                    <h1 className="display-5 fw-bold mb-3 tittle tittleAfter">
                        Categorias e Subcategorias
                    </h1>

                    <p className="text-muted mb-4">
                        Organize as áreas de conhecimento utilizadas nas propostas de TCC.
                    </p>

                    <div className="d-flex gap-2 flex-wrap mb-4">
                        <Button
                            variant={mostrandoCategorias ? 'primary' : 'outline-primary'}
                            onClick={() => this.setState({ aba: 'categorias' })}
                        >
                            Categorias
                        </Button>

                        <Button
                            variant={!mostrandoCategorias ? 'primary' : 'outline-primary'}
                            onClick={() => this.setState({ aba: 'subcategorias' })}
                        >
                            Subcategorias
                        </Button>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                <h4 className="mb-0">
                                    {mostrandoCategorias ? 'Categorias cadastradas' : 'Subcategorias cadastradas'}
                                </h4>

                                <Button
                                    variant="primary"
                                    disabled={!mostrandoCategorias && categorias.length === 0}
                                    onClick={() => this.abrirCadastro(tipoAtual)}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    {mostrandoCategorias ? 'Nova Categoria' : 'Nova Subcategoria'}
                                </Button>
                            </div>

                            {carregando ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" />
                                    <p className="mt-3">Carregando registros...</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="align-middle">
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Descrição</th>
                                                {!mostrandoCategorias && <th>Categoria</th>}
                                                <th className="text-end">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itens.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={mostrandoCategorias ? 3 : 4}
                                                        className="text-center text-muted py-4"
                                                    >
                                                        Nenhum registro cadastrado.
                                                    </td>
                                                </tr>
                                            ) : itens.map(item => (
                                                <tr key={item.id}>
                                                    <td className="fw-semibold">
                                                        {mostrandoCategorias
                                                            ? item.nomeCategoria
                                                            : item.nomeSubcategoria}
                                                    </td>
                                                    <td>
                                                        {(mostrandoCategorias
                                                            ? item.descricaoCategoria
                                                            : item.descricaoSubcategoria) || '—'}
                                                    </td>
                                                    {!mostrandoCategorias && (
                                                        <td>{this.nomeCategoria(item.idCategoria)}</td>
                                                    )}
                                                    <td className="text-end">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => this.abrirEdicao(tipoAtual, item)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => this.confirmarExclusao(tipoAtual, item)}
                                                        >
                                                            Excluir
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Modal
                    show={modalAberto}
                    onHide={() => !salvando && this.setState({ modalAberto: false })}
                    centered
                >
                    <Form onSubmit={this.salvar}>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {editandoId ? 'Editar' : 'Nova'}{' '}
                                {tipo === 'categoria' ? 'Categoria' : 'Subcategoria'}
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Nome *</Form.Label>
                                <Form.Control
                                    required
                                    maxLength={255}
                                    value={nome}
                                    onChange={event => this.setState({ nome: event.target.value })}
                                    placeholder="Digite o nome"
                                />
                            </Form.Group>

                            {tipo === 'subcategoria' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoria *</Form.Label>
                                    <Form.Select
                                        required
                                        value={idCategoria}
                                        onChange={event => this.setState({ idCategoria: event.target.value })}
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nomeCategoria}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}

                            <Form.Group>
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={descricao}
                                    onChange={event => this.setState({ descricao: event.target.value })}
                                    placeholder="Descreva o assunto"
                                />
                            </Form.Group>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                disabled={salvando}
                                onClick={() => this.setState({ modalAberto: false })}
                            >
                                Cancelar
                            </Button>

                            <Button variant="primary" type="submit" disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                <Modal
                    show={modalExclusao}
                    onHide={() => !salvando && this.setState({ modalExclusao: false })}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar exclusão</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        Deseja realmente excluir{' '}
                        <strong>
                            {excluindo && (
                                tipo === 'categoria'
                                    ? excluindo.nomeCategoria
                                    : excluindo.nomeSubcategoria
                            )}
                        </strong>?
                        <p className="text-muted mt-2 mb-0">
                            Registros vinculados a TCCs ou outras informações podem impedir a exclusão.
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            disabled={salvando}
                            onClick={() => this.setState({ modalExclusao: false })}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            disabled={salvando}
                            onClick={this.excluir}
                        >
                            {salvando ? 'Excluindo...' : 'Confirmar exclusão'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default Categoria;