import { getStatusAtividade } from './statusAtividade';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import { AtividadeService } from '../../service/AtividadeService';
import { EntregaAtividadeService } from '../../service/EntregaAtividadeService';

const formatarData = valor => valor
    ? valor.substring(0, 10).split('-').reverse().join('/') : '-';

export default function DetalhesAtividade() {
    const { turmaId, atividadeId } = useParams();
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filtro, setFiltro] = useState('TODOS');
    const [erroDownload, setErroDownload] = useState('');
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        let ativo = true;
        setCarregando(true);
        setErro('');
        new AtividadeService().findByTurma(turmaId)
            .then(response => {
                if (ativo) setItens((response.data || []).filter(item => item.idAtividade === atividadeId));
            })
            .catch(() => {
                if (ativo) setErro('Não foi possível carregar a atividade. Verifique sua permissão e tente novamente.');
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, [turmaId, atividadeId, tentativa]);

    const baixar = async item => {
        setErroDownload('');
        try {
            const response = await new EntregaAtividadeService().downloadArquivo(item.idEntrega);
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = item.arquivoNome;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setErroDownload('Não foi possível baixar o arquivo.');
        }
    };

    const atividade = itens[0];
    const alunos = [...new Map(itens.filter(item => item.idAluno).map(item => [item.idAluno, item])).values()];
    const entregaram = alunos.filter(item => item.idEntrega && item.dataRealizacao).length;
    const pendentes = alunos.length - entregaram;
    const visiveis = alunos.filter(item => {
        const entregue = Boolean(item.idEntrega && item.dataRealizacao);
        return filtro === 'TODOS' || (filtro === 'ENTREGUES' ? entregue : !entregue);
    }).sort((a, b) => (a.nomeAluno || '').localeCompare(b.nomeAluno || '', 'pt-BR'));

    return (
        <div className="tcc-page bg-light min-vh-100">
            <Navbar />
            <main className="page-content container-fluid px-4 pb-5">
                <Link to={`/atividades?turma=${turmaId}`} className="btn btn-outline-secondary mt-4 mb-3">Voltar às atividades</Link>
                <h1 className="display-5 fw-bold mb-4">Detalhes da atividade</h1>
                {carregando ? <p role="status">Carregando atividade...</p> : erro ? (
                    <div className="alert alert-danger" role="alert">
                        {erro}
                        <button className="btn btn-link" onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</button>
                    </div>
                ) : !atividade ? <div className="alert alert-warning">Atividade não encontrada nesta turma.</div> : (
                    <>
                        <div className="card shadow-sm border-0 mb-4"><div className="card-body">
                            <h2 className="h4">{atividade.descricao}</h2>
                            <p className="mb-0"><strong>Prazo:</strong> {formatarData(atividade.dataEntrega)}</p>
                        </div></div>
                        <div className="row g-3 mb-4">
                            {[['Total de alunos', alunos.length, 'primary'], ['Entregaram', entregaram, 'success'], ['Faltam entregar', pendentes, 'warning']].map(([titulo, total, cor]) => (
                                <div className="col-12 col-md-4" key={titulo}>
                                    <div className={`card border-${cor} h-100`}><div className="card-body">
                                        <h3 className="h6">{titulo}</h3><strong className="display-6">{total}</strong>
                                    </div></div>
                                </div>
                            ))}
                        </div>
                        <div className="card shadow-sm border-0"><div className="card-body">
                            <h2 className="h5">Entregas dos alunos</h2>
                            <label htmlFor="filtro-entregas" className="form-label">Mostrar alunos</label>
                            <select id="filtro-entregas" className="form-select mb-3" value={filtro} onChange={event => setFiltro(event.target.value)}>
                                <option value="TODOS">Todos ({alunos.length})</option>
                                <option value="ENTREGUES">Entregaram ({entregaram})</option>
                                <option value="PENDENTES">Faltam entregar ({pendentes})</option>
                            </select>
                            {erroDownload && <p className="alert alert-danger" role="alert">{erroDownload}</p>}
                            <div className="table-responsive"><table className="table table-hover align-middle">
                                <thead><tr><th>Aluno</th><th>Situação</th><th>Data de entrega</th><th>Nota</th><th>Arquivo</th></tr></thead>
                                <tbody>
                                    {visiveis.length === 0 ? <tr><td colSpan="5" className="text-center text-muted">Nenhum aluno neste grupo.</td></tr> : visiveis.map(item => (
                                        <tr key={item.idAluno}>
                                            <td>{item.nomeAluno}</td>
                                            <td><span className={`badge ${getStatusAtividade(item).classe}`}>
                                                {getStatusAtividade(item).texto}
                                            </span></td>
                                            <td>{formatarData(item.dataRealizacao)}</td>
                                            <td>{item.nota ?? '-'}</td>
                                            <td>{item.idEntrega && item.arquivoNome ? <button className="btn btn-sm btn-outline-primary" onClick={() => baixar(item)}>{item.arquivoNome}</button> : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                        </div></div>
                    </>
                )}
            </main>
        </div>
    );
}
