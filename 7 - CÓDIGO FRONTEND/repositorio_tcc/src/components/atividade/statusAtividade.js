export const getStatusAtividade = (item) => {
    const somenteData = valor => {
        const data = String(valor || '').substring(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : null;
    };
    const entrega = somenteData(item.dataRealizacao);
    const prazo = somenteData(item.dataEntrega);

    if (!entrega) {
        return { codigo: 'NAO_ENTREGUE', texto: 'Não entregue', classe: 'bg-secondary' };
    }
    if (!prazo) {
        return { codigo: 'SEM_PRAZO', texto: 'Sem prazo', classe: 'bg-secondary' };
    }
    if (entrega > prazo) {
        return { codigo: 'ENTREGUE_COM_ATRASO', texto: 'Atrasado', classe: 'bg-danger' };
    }
    return { codigo: 'ENTREGUE_NO_PRAZO', texto: 'Entregue no prazo', classe: 'bg-success' };
};
