import React, { Component } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import { TCCService } from '../../service/TCCService';
import { CategoriaService } from '../../service/CategoriaService';
import { SubcategoriaService } from '../../service/SubcategoriaService';
import { ToastContainer, toast } from 'react-toastify';
import { AtividadeService } from '../../service/AtividadeService';
import { axiosInstance } from '../../service/BaseService';

class DetalhesPropostaTcc extends Component {

    state = {
    proposta: null,
    nomeCategoria: '',
    nomeSubcategoria: '',
    atividades: [],
    carregando: true,
    carregandoAtividades: true,
    erroAtividades: false
};

tccService = new TCCService();
categoriaService = new CategoriaService();
subcategoriaService = new SubcategoriaService();
atividadeService = new AtividadeService();

componentDidMount() {
    this.carregarProposta();
    this.carregarAtividades();
}

carregarClassificacao = async (idCategoria, idSubcategoria) => {
    this.setState({
        nomeCategoria: '',
        nomeSubcategoria: ''
    });

    try {
        const [categoriasResponse, subcategoriasResponse] = await Promise.all([
            this.categoriaService.listAll(),
            this.subcategoriaService.findAllByCategoria(idCategoria)
        ]);

        const categoria = categoriasResponse.data.find(
            item => item.id === idCategoria
        );

        const subcategoria = subcategoriasResponse.data.find(
            item => item.id === idSubcategoria
        );

        this.setState({
            nomeCategoria: categoria?.nomeCategoria || 'Nao informada',
            nomeSubcategoria: subcategoria?.nomeSubcategoria || 'Nao informada'
        });
    } catch (error) {
        console.error('Erro ao carregar classificacao:', error);
        this.setState({
            nomeCategoria: 'Nao disponivel',
            nomeSubcategoria: 'Nao disponivel'
        });
    }
};
carregarProposta = () => {
    const { id } = this.props;

    this.tccService.findById(id)
        .then(response => {
            this.setState({
                proposta: response.data,

                carregando: false
            });
            this.carregarClassificacao(response.data.idCategoria, response.data.idSubcategoria);
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
    Voltar às Solicitações
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
<p><strong>Categoria:</strong> {this.state.nomeCategoria || 'Carregando...'}</p>
<p><strong>Subcategoria:</strong> {this.state.nomeSubcategoria || 'Carregando...'}</p>

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





                                <h5>Andamento da Aprovação</h5>

                                <div className="mt-3">
                                    <p>✅ Proposta submetida</p>

                                    <p>
                                        {proposta.status === 'AGUARDANDO_ORIENTADOR'
                                            ? '⏳ Aguardando aprovação do orientador'
                                            : '✅ Aprovação do orientador concluída'}
                                    </p>

                                    <p>
                                        {proposta.status === 'PROPOSTA_APROVADA'
                                            ? '✅ Aprovação da coordenação concluída'
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
) : (
    <>
        {(() => {
            const entregasComArquivo = atividades
                .filter(atividade => atividade.id && atividade.arquivoNome)
                .sort((a, b) => {
                    const dataA = a.dataHoraEnvio || a.dataRealizacao || '';
                    const dataB = b.dataHoraEnvio || b.dataRealizacao || '';
                    return dataB.localeCompare(dataA);
                });

            const arquivoAtual = entregasComArquivo[0];

            return (
                <div className="card border-primary mb-4">
                    <div className="card-body">
                        <h6 className="card-title mb-3">
                            📄 Versão atual do TCC
                        </h6>

                        {arquivoAtual ? (
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                <div>
                                    <p className="mb-1 fw-semibold">
                                        {arquivoAtual.arquivoNome}
                                    </p>

                                    <small className="text-muted">
                                        Última entrega: {arquivoAtual.dataRealizacao || 'Não informada'}
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => this.baixarArquivo(arquivoAtual)}
                                >
                                    📥 Baixar PDF atual
                                </button>
                            </div>
                        ) : (
                            <p className="text-muted mb-0">
                                Nenhum PDF foi enviado até o momento.
                            </p>
                        )}
                    </div>
                </div>
            );
        })()}

        <h6 className="mb-3">Histórico de atividades</h6>

        {atividades.length === 0 ? (
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
                        </tr>
                    </thead>

                    <tbody>
                        {atividades.map(atividade => (
                            <tr key={atividade.idAtividade}>
                                <td>{atividade.descricaoAtividade}</td>
                                <td>{atividade.dataEntrega || '—'}</td>
                                <td>
                                    {atividade.id ? (
                                        <span className="badge bg-success">
                                            Entregue
                                        </span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">
                                            Pendente
                                        </span>
                                    )}
                                </td>
                                <td>{atividade.dataRealizacao || '—'}</td>
                                <td>{atividade.nota ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </>
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