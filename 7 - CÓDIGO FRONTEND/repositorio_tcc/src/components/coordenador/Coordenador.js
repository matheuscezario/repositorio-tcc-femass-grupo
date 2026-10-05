import React, { Component } from 'react';

import InputMask from 'react-input-mask';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal } from 'react-bootstrap';

import Navbar from '../navbar/Navbar';

class Coordenador extends Component {

    state = {
        listCoordenador: [],
        showModalDeletion: false,
        showModalEdit: false,
        toDeleteItem: null,
        toEditItem: null,
        nomeCompleto: '',
        cpf: '',
        telefone: '',
        email: ''
    }

    register = (event) => {
        event.preventDefault();

        const url = window.server + "/coordenadores";

        const data = {
            nomeCompleto: this.state.nomeCompleto,
            cpf: this.state.cpf.replace(/[^\d]/g, ''),
            telefone: this.state.telefone.replace(/[^\d]/g, ''),
            email: this.state.email
        };

        const token = sessionStorage.getItem('token');

        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        fetch(url, requestOptions)
            .then((response) => {
                if (response.ok) {
                    toast.success('Coordenador criado!', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined
                    });

                    this.clearState();

                    setTimeout(() => {
                        this.fillList();
                    }, 500);

                    return;
                }

                toast.error('Erro ao criar coordenador', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined
                });

                throw new Error('Falha na requisição: ' + response.status);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    fillList = () => {
        const url = window.server + "/coordenadores";
        const token = sessionStorage.getItem('token');

        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };

        fetch(url, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro na requisição: ' + response.status);
                }

                return response.json();
            })
            .then((data) => {
                this.setState({
                    listCoordenador: data
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    componentDidMount() {
        this.fillList();
    }

    beginDeletion = (coordenador) => {
        this.setState({
            toDeleteItem: coordenador,
            showModalDeletion: true
        });
    }

    delete = () => {
        const url =
            window.server +
            "/coordenadores/" +
            this.state.toDeleteItem.id;

        const token = sessionStorage.getItem('token');

        const requestOptions = {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };

        fetch(url, requestOptions)
            .then((response) => {
                if (response.ok) {
                    this.fillList();

                    this.setState({
                        showModalDeletion: false,
                        toDeleteItem: null
                    });

                    toast.success('Coordenador excluído!', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined
                    });

                    return;
                }

                toast.error('Não foi possível excluir', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined
                });

                throw new Error(
                    'Erro na requisição: ' + response.status
                );
            })
            .catch((error) => {
                console.error(error);
            });
    }

    beginEdit = (coordenador) => {
        const url =
            window.server +
            "/coordenadores/" +
            coordenador.id;

        const token = sessionStorage.getItem('token');

        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };

        fetch(url, requestOptions)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }

                throw new Error(
                    'Erro na requisição: ' + response.status
                );
            })
            .then((data) => {
                this.setState({
                    toEditItem: data,
                    showModalEdit: true,
                    nomeCompleto: data.nomeCompleto || '',
                    cpf: data.cpf || '',
                    telefone: data.telefone || '',
                    email: data.email || ''
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    submitCoordenadorForm = (event) => {
        event.preventDefault();

        let url = window.server + "/coordenadores";
        const token = sessionStorage.getItem('token');

        const data = {
            nomeCompleto: this.state.nomeCompleto,
            cpf: this.state.cpf.replace(/[^\d]/g, ''),
            telefone: this.state.telefone.replace(/[^\d]/g, ''),
            email: this.state.email
        };

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        url += "/" + this.state.toEditItem.id;

        fetch(url, requestOptions)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }

                throw new Error(
                    'Erro na requisição: ' + response.status
                );
            })
            .then(() => {
                this.setState({
                    showModalEdit: false,
                    toEditItem: null
                });

                toast.success('Coordenador atualizado!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined
                });

                this.clearState();
                this.fillList();
            })
            .catch((error) => {
                console.error(error);

                toast.error('Ocorreu um erro', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined
                });
            });
    }

    closeModal = () => {
        this.clearState();

        this.setState({
            showModalEdit: false,
            toEditItem: null
        });
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    clearState = () => {
        this.setState({
            nomeCompleto: '',
            cpf: '',
            telefone: '',
            email: ''
        });
    }

    render() {
        return (
            <div>
                <Navbar />
                <ToastContainer />

                <div className='page-content'>

                    <div className="col-12 mb-4 mt-4">
                        <h1 className='display-5 fw-bold mb-4 tittle tittleAfter'>
                            Coordenadores
                        </h1>
                    </div>

                    <div className='mt-5 mb-3 container-fluid d-flex flex-column justify-content-between'>
                        <div className='row justify-content-center'>
                            <div className='col-10 col-md-6 col-lg-5 col-xl-4'>

                                <div className='bg-white border rounded p-4'>

                                    <form onSubmit={this.register}>

                                        <div>
                                            <h3>Cadastro de Coordenador</h3>
                                        </div>

                                        <div className="mb-3 justify-content-center">
                                            <label
                                                htmlFor="nomeCompleto"
                                                className="form-label"
                                            >
                                                Nome Completo
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                name="nomeCompleto"
                                                id="nomeCompleto"
                                                onChange={this.handleChange}
                                                value={this.state.nomeCompleto}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3 justify-content-center">
                                            <label
                                                htmlFor="cpf"
                                                className="form-label"
                                            >
                                                CPF
                                            </label>

                                            <InputMask
                                                mask="999.999.999-99"
                                                type="text"
                                                className="form-control"
                                                name="cpf"
                                                id="cpf"
                                                onChange={this.handleChange}
                                                value={this.state.cpf}
                                                required
                                            >
                                                {(inputProps) =>
                                                    <input
                                                        {...inputProps}
                                                        type="text"
                                                    />
                                                }
                                            </InputMask>
                                        </div>

                                        <div className="mb-3 justify-content-center">
                                            <label
                                                htmlFor="telefone"
                                                className="form-label"
                                            >
                                                Telefone
                                            </label>

                                            <InputMask
                                                mask="(99)9999-99999"
                                                type="text"
                                                className="form-control"
                                                name="telefone"
                                                id="telefone"
                                                onChange={this.handleChange}
                                                value={this.state.telefone}
                                                required
                                            >
                                                {(inputProps) =>
                                                    <input
                                                        {...inputProps}
                                                        type="text"
                                                    />
                                                }
                                            </InputMask>
                                        </div>

                                        <div className="mb-3 justify-content-center">
                                            <label
                                                htmlFor="email"
                                                className="form-label"
                                            >
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                id="email"
                                                required
                                                placeholder="email@email.com"
                                                onChange={this.handleChange}
                                                value={this.state.email}
                                            />
                                        </div>

                                        <div className="mb-3 justify-content-center">
                                            <button
                                                className="btn btn-dark"
                                                type="submit"
                                            >
                                                Criar
                                            </button>
                                        </div>

                                    </form>

                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="text-center">
                        Lista de Coordenadores
                    </h4>

                    <div className="container">

                        <table className="table table-striped table-hover">
                            <tbody>

                                <tr>
                                    <td className="text-center">
                                        Nome
                                    </td>

                                    <td className="text-center">
                                        Email
                                    </td>

                                    <td className="text-center">
                                        Ações
                                    </td>
                                </tr>

                                {this.state.listCoordenador &&
                                this.state.listCoordenador.length > 0 ? (

                                    this.state.listCoordenador.map(
                                        (data) => (
                                            <tr key={data.id}>

                                                <td className="text-center">
                                                    {data.nomeCompleto}
                                                </td>

                                                <td className="text-center">
                                                    {data.email}
                                                </td>

                                                <td className="text-center">

                                                    <button
                                                        className="btn btn-danger me-2"
                                                        onClick={() =>
                                                            this.beginDeletion(data)
                                                        }
                                                    >
                                                        Deletar
                                                    </button>

                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={() =>
                                                            this.beginEdit(data)
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                </td>
                                            </tr>
                                        )
                                    )

                                ) : (

                                    <tr>
                                        <td
                                            colSpan={3}
                                            className='text-center fw-bold'
                                        >
                                            Nenhum coordenador encontrado
                                        </td>
                                    </tr>

                                )}

                            </tbody>
                        </table>
                    </div>

                    <Modal
                        show={this.state.showModalDeletion}
                        onHide={() =>
                            this.setState({
                                toDeleteItem: null,
                                showModalDeletion: false
                            })
                        }
                        centered
                    >
                        <Modal.Header
                            className='bg-dark text-white'
                            closeButton
                            closeVariant='white'
                        >
                            <Modal.Title>
                                Confirmar Exclusão
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            Tem certeza que deseja excluir o Coordenador{' '}

                            {this.state.toDeleteItem &&
                                <span className='fw-bold'>
                                    {this.state.toDeleteItem.nomeCompleto}
                                </span>
                            }?
                        </Modal.Body>

                        <Modal.Footer>

                            <Button
                                variant="secondary"
                                onClick={() =>
                                    this.setState({
                                        toDeleteItem: null,
                                        showModalDeletion: false
                                    })
                                }
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="primary"
                                onClick={this.delete}
                            >
                                Confirmar
                            </Button>

                        </Modal.Footer>
                    </Modal>

                    <Modal
                        show={this.state.showModalEdit}
                        onHide={this.closeModal}
                        centered
                        size='xl'
                    >
                        <Modal.Header
                            className='bg-dark text-white'
                            closeButton
                            closeVariant='white'
                        >
                            <Modal.Title>
                                Editar Coordenador
                            </Modal.Title>
                        </Modal.Header>

                        <form onSubmit={this.submitCoordenadorForm}>

                            <Modal.Body>

                                <div className="modal-body">
                                    <div className="container">
                                        <div className="mb-3 row">

                                            <div className="col-12">
                                                <label
                                                    htmlFor="editNomeCompleto"
                                                    className="col-4 col-form-label fw-bold required"
                                                >
                                                    Nome Completo
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="nomeCompleto"
                                                    id="editNomeCompleto"
                                                    onChange={this.handleChange}
                                                    value={this.state.nomeCompleto}
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label
                                                    htmlFor="editCpf"
                                                    className="col-12 col-form-label fw-bold"
                                                >
                                                    CPF
                                                </label>

                                                <InputMask
                                                    mask="999.999.999-99"
                                                    type="text"
                                                    className="form-control"
                                                    name="cpf"
                                                    id="editCpf"
                                                    onChange={this.handleChange}
                                                    value={this.state.cpf}
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label
                                                    htmlFor="editTelefone"
                                                    className="col-12 col-form-label fw-bold"
                                                >
                                                    Telefone
                                                </label>

                                                <InputMask
                                                    mask="(99)9999-99999"
                                                    type="text"
                                                    className="form-control"
                                                    name="telefone"
                                                    id="editTelefone"
                                                    onChange={this.handleChange}
                                                    value={this.state.telefone}
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label
                                                    htmlFor="editEmail"
                                                    className="col-12 col-form-label fw-bold"
                                                >
                                                    Email
                                                </label>

                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    id="editEmail"
                                                    onChange={this.handleChange}
                                                    value={this.state.email}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </Modal.Body>

                            <Modal.Footer>

                                <Button
                                    variant="secondary"
                                    onClick={this.closeModal}
                                >
                                    Fechar
                                </Button>

                                <button
                                    type='submit'
                                    className="btn btn-primary"
                                >
                                    Salvar
                                </button>

                            </Modal.Footer>

                        </form>
                    </Modal>

                </div>
            </div>
        );
    }
}

export default Coordenador;