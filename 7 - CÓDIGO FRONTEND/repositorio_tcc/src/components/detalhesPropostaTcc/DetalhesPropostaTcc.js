import React, { Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import { TCCService } from '../../service/TCCService';
import { ToastContainer, toast } from 'react-toastify';

class DetalhesPropostaTcc extends Component {

    state = {
        proposta: null,
        carregando: true
    };

    tccService = new TCCService();

    componentDidMount() {
        this.carregarProposta();
    }

    carregarProposta = () => {
        const { id } = this.props;

        this.tccService.findById(id)
            .then(response => {
                this.setState({
                    proposta: response.data,
                    carregando: false
                });
            })
            .catch(error => {
                console.error('Erro ao carregar proposta:', error);

                this.setState({ carregando: false });

                toast.error(
                    error.response?.status === 403
                        ? 'Você não tem permissão para visualizar esta proposta.'
                        : 'Não foi possível carregar a proposta.'
                );
            });
    };

    render() {
        const { proposta, carregando } = this.state;

        return (
            <>
                <Navbar />
                <ToastContainer />

                <div
    className="container mb-5"
    style={{ paddingTop: '110px' }}
>

                    <Link
    to="/solicitacoes-tcc"
    className="btn btn-outline-secondary mb-4"
>
    ← Voltar às Solicitações
</Link>

                    <h2 className="mb-4">Detalhes da Proposta de TCC</h2>

                    {carregando ? (
                        <p>Carregando proposta...</p>
                    ) : proposta ? (
                        <div className="card shadow-sm">
                            <div className="card-body p-4">

                                <h4 className="mb-4">{proposta.titulo}</h4>

                                <p><strong>Aluno:</strong> {proposta.nomeCompletoAluno}</p>

                                <p><strong>Orientador:</strong> {proposta.nomeCompletoOrientador}</p>

                                <p><strong>Curso:</strong> {proposta.nomeCurso}</p>

                                <p>
                                    <strong>Status:</strong>{' '}
                                    {proposta.status === 'AGUARDANDO_ORIENTADOR'
                                        ? 'Aguardando aprovação do orientador'
                                        : proposta.status === 'AGUARDANDO_COORDENADOR'
                                        ? 'Aguardando aprovação do coordenador'
                                        : proposta.status === 'PROPOSTA_APROVADA'
                                        ? 'Proposta aprovada'
                                        : proposta.status}
                                </p>

                                <hr />

                                <h5>Resumo da Proposta</h5>

                                <p style={{ whiteSpace: 'pre-wrap' }}>
                                    {proposta.resumo || 'Nenhum resumo informado.'}
                                </p>

                                <hr />

                                <h5>Palavras-chave</h5>

                                {proposta.palavrasChave?.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {proposta.palavrasChave.map((palavra, index) => (
                                            <span
                                                key={index}
                                                className="badge bg-secondary"
                                            >
                                                {palavra.palavra || palavra.nome || 'Palavra-chave'}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Nenhuma palavra-chave cadastrada.</p>
                                )}

                                <hr />

                                <h5>Andamento da Aprovação</h5>

                                <div className="mt-3">
                                    <p>✅ Proposta enviada pelo aluno</p>

                                    <p>
                                        {proposta.status === 'AGUARDANDO_ORIENTADOR'
                                            ? '⏳ Aguardando aprovação do orientador'
                                            : '✅ Orientador aprovou'}
                                    </p>

                                    <p>
                                        {proposta.status === 'PROPOSTA_APROVADA'
                                            ? '✅ Coordenador aprovou'
                                            : '⏳ Aguardando aprovação do coordenador'}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            Não foi possível visualizar esta proposta.
                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default function DetalhesPropostaTccPage() {
    const { id } = useParams();

    return <DetalhesPropostaTcc id={id} />;
}