import React, { Component } from 'react';

import Navbar from '../navbar/Navbar';

import { ToastContainer, toast } from 'react-toastify';

import DataTable from 'react-data-table-component';

import { motion } from 'framer-motion';

import { TCCService } from '../../service/TCCService';

import '../../assets/css/meutcc.css';

class SolicitacaoTcc extends Component {

    state = {
    solicitacoes: [],
    propostasEmAcompanhamento: [],
    propostasAprovadas: []
}

    tccService = new TCCService();

    columns = [
    {
        name: 'Título',
        selector: row => row.titulo,
        sortable: true
    },
    {
        name: 'Aluno',
        cell: row => <span>{row.nomeCompletoAluno}</span>,
        sortable: true
    },
    {
        name: 'Orientador',
        selector: row => row.nomeCompletoOrientador,
        sortable: true
    },
    {
        name: 'Status',
        selector: row =>
            row.status === 'AGUARDANDO_ORIENTADOR'
                ? 'Aguardando Orientador'
                : 'Aguardando Coordenador'
    },
    {
    name: 'Ações',
    cell: row => (
        <div className="d-flex gap-2">
            <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                    window.location.href = `/tcc/proposta/${row.id}`;
                }}
            >
                Visualizar
            </button>

            {row.status === 'AGUARDANDO_ORIENTADOR' ? (
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => this.aprovarOrientador(row.id)}
                >
                    Aprovar
                </button>
            ) : row.status === 'AGUARDANDO_COORDENADOR' ? (
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => this.aprovarCoordenador(row.id)}
                >
                    Aprovar
                </button>
            ) : null}
        </div>
    )
}
];

columnsAcompanhamento = [
    {
        name: 'Título',
        selector: row => row.titulo,
        sortable: true
    },
    {
        name: 'Aluno',
        selector: row => row.nomeCompletoAluno,
        sortable: true
    },
    {
        name: 'Orientador',
        selector: row => row.nomeCompletoOrientador,
        sortable: true
    },
    {
        name: 'Status',
        cell: row => (
            <span className="badge bg-warning text-dark">
                Aguardando Coordenador
            </span>
        )
    },
    {
        name: 'Ações',
        cell: row => (
            <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                    window.location.href = `/tcc/proposta/${row.id}`;
                }}
            >
                Visualizar
            </button>
        )
    }
];

columnsAprovadas = [
    {
        name: 'Título',
        selector: row => row.titulo,
        sortable: true
    },
    {
        name: 'Aluno',
        selector: row => row.nomeCompletoAluno,
        sortable: true
    },
    {
        name: 'Orientador',
        selector: row => row.nomeCompletoOrientador,
        sortable: true
    },
    {
        name: 'Status',
        cell: row => (
            <span className="badge bg-success">
                Proposta Aprovada
            </span>
        )
    },
    {
        name: 'Ações',
        cell: row => (
            <button
                className="btn btn-outline-primary btn-sm"
                onClick={() =>
                    window.location.href = `/tcc/proposta/${row.id}`
                }
            >
                Visualizar
            </button>
        )
    }
];

    componentDidMount() {
    this.carregarSolicitacoes();
}

carregarSolicitacoes = () => {
    Promise.all([
        this.tccService.listarSolicitacoesPendentes(),
        this.tccService.listarPropostasEmAcompanhamento(),
        this.tccService.listarPropostasAprovadas()
    ])
        .then(([responsePendentes, responseAcompanhamento, responseAprovadas]) => {

            const solicitacoes = responsePendentes.data;
            const propostasEmAcompanhamento = responseAcompanhamento.data;
            const propostasAprovadas = responseAprovadas.data;

            this.setState({
                solicitacoes,
                propostasEmAcompanhamento,
                propostasAprovadas
            });
        })
        .catch(error => {
            console.error('Erro ao carregar solicitações:', error);

            toast.error('Erro ao carregar solicitações.', {
                position: 'top-right',
                autoClose: 3000
            });
        });
}

aprovarOrientador = (id) => {
    this.tccService.aprovarPeloOrientador(id)
        .then(() => {
            toast.success('Proposta aprovada pelo orientador!', {
                position: "top-right",
                autoClose: 2000
            });

            this.carregarSolicitacoes();
        })
        .catch((error) => {
            console.error('Erro ao aprovar proposta:', error);

            toast.error('Erro ao aprovar proposta.', {
                position: "top-right",
                autoClose: 3000
            });
        });
}

aprovarCoordenador = (id) => {
    this.tccService.aprovarPeloCoordenador(id)
        .then(() => {
            toast.success('Proposta aprovada pelo coordenador!', {
                position: "top-right",
                autoClose: 2000
            });

            this.carregarSolicitacoes();
        })
        .catch((error) => {
            console.error('Erro ao aprovar proposta pelo coordenador:', error);

            toast.error('Erro ao aprovar proposta.', {
                position: "top-right",
                autoClose: 3000
            });
        });
}

    render() {
        return (
            <div className="tcc-page bg-light min-vh-100">
                <Navbar />
                <ToastContainer />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="page-content container-fluid px-4"
                >
                    <div className="row mb-4 mt-4">
                        <div className="col-12">
                            <h1 className="display-5 fw-bold mb-4 tittle tittleAfter">
                                Solicitações TCC
                            </h1>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm mb-4">
    <div className="card-body">
        <h4 className="fw-bold mb-3">
            Solicitações Pendentes
        </h4>

        <DataTable
            columns={this.columns}
            data={this.state.solicitacoes}
            noDataComponent={
                <div className="p-4 text-center text-muted">
                    Nenhuma solicitação de TCC pendente
                </div>
            }
        />
    </div>
</div>

<div className="card border-0 shadow-sm mb-4">
    <div className="card-body">
        <h4 className="fw-bold mb-3">
            Aguardando Coordenador
        </h4>

        <DataTable
            columns={this.columnsAcompanhamento}
            data={this.state.propostasEmAcompanhamento}
            noDataComponent={
                <div className="p-4 text-center text-muted">
                    Nenhuma proposta aguardando aprovação do coordenador
                </div>
            }
        />
    </div>
</div>

<div className="card border-0 shadow-sm">
    <div className="card-body">
        <h4 className="fw-bold mb-3">
            Propostas Aprovadas
        </h4>

        <DataTable
            columns={this.columnsAprovadas}
            data={this.state.propostasAprovadas}
            noDataComponent={
                <div className="p-4 text-center text-muted">
                    Nenhuma proposta de TCC aprovada
                </div>
            }
        />
    </div>
</div>

                </motion.div>
            </div>
        );
    }
}

export default SolicitacaoTcc;