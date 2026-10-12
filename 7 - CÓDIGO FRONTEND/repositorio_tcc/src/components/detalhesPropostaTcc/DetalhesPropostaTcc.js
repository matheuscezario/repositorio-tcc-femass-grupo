import React, { Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import { TCCService } from '../../service/TCCService';
import { ToastContainer, toast } from 'react-toastify';
import { AtividadeService } from '../../service/AtividadeService';
import { axiosInstance } from '../../service/BaseService';

class DetalhesPropostaTcc extends Component {

    state = {
    proposta: null,
    atividades: [],
    carregando: true,
    carregandoAtividades: true,
    erroAtividades: false
};

tccService = new TCCService();
atividadeService = new AtividadeService();

componentDidMount() {
    this.carregarProposta();
    this.carregarAtividades();
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

carregarAtividades = () => {
    const { id } = this.props;

    this.atividadeService.findByTcc(id)
        .then(response => {
            this.setState({
                atividades: response.data || [],
                carregandoAtividades: false,
                erroAtividades: false
            });
        })
        .catch(error => {
            console.error('Erro ao carregar atividades:', error);

            this.setState({
                carregandoAtividades: false,
                erroAtividades: true
            });
        });
};

baixarArquivo = async (atividade) => {
    if (!atividade.id || !atividade.arquivoNome) {
        toast.warning('Esta atividade não possui arquivo disponível.');
        return;
    }

    try {
        const response = await axiosInstance.get(
            `/entregas-atividade/${atividade.id}/arquivo`,
            { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');

        link.href = url;
        link.download = atividade.arquivoNome;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);

        toast.error(
            error.response?.status === 403
                ? 'Você não tem permissão para baixar este arquivo.'
                : 'Não foi possível baixar o arquivo.'
        );
    }
};

    render() {
        const {
    proposta,
    atividades,
    carregando,
    carregandoAtividades,
    erroAtividades
} = this.state;

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

                                <hr />

<h5 className="mb-3">Acompanhamento de Atividades</h5>

{carregandoAtividades ? (
    <p>Carregando atividades...</p>
) : erroAtividades ? (
    <div className="alert alert-warning">
        Não foi possível carregar as atividades deste aluno.
    </div>
) : atividades.length === 0 ? (
    <p className="text-muted">
        Nenhuma atividade cadastrada para este aluno.
    </p>
) : (
    <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
            <thead>
                <tr>
                    <th>Atividade</th>
                    <th>Prazo</th>
                    <th>Situação</th>
                    <th>Data da entrega</th>
                    <th>Nota</th>
                    <th>Arquivo</th>
                </tr>
            </thead>
            <tbody>
                {atividades.map(atividade => (
                    <tr key={atividade.idAtividade}>
                        <td>{atividade.descricaoAtividade}</td>
                        <td>{atividade.dataEntrega || '—'}</td>
                        <td>
                            {atividade.id ? (
                                <span className="badge bg-success">Entregue</span>
                            ) : (
                                <span className="badge bg-warning text-dark">
                                    Pendente
                                </span>
                            )}
                        </td>
                        <td>{atividade.dataRealizacao || '—'}</td>
                        <td>{atividade.nota ?? '—'}</td>
                        <td>
    {atividade.id && atividade.arquivoNome ? (
        <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => this.baixarArquivo(atividade)}
        >
            📄 Baixar PDF
        </button>
    ) : (
        <span className="text-muted">—</span>
    )}
</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)}

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