import { axiosInstance, BaseService } from './BaseService';

export class TCCService extends BaseService {

    constructor(){
        super("/tcc");
    }

    getMyTcc(){
        return axiosInstance.get(`${this.url}/my`);
    }

    criarProposta(data){
        return axiosInstance.post(`${this.url}/proposta`, data);
    }

    listarSolicitacoesPendentes(){
    return axiosInstance.get(`${this.url}/solicitacoes-pendentes`);
}

listarPropostasEmAcompanhamento() {
    return axiosInstance.get(`${this.url}/propostas-em-acompanhamento`);
}

listarPropostasAprovadas() {
    return axiosInstance.get(`${this.url}/propostas-aprovadas`);
}

    aprovarPeloOrientador(id){
        return axiosInstance.put(`${this.url}/${id}/aprovar-orientador`);
    }

    aprovarPeloCoordenador(id){
        return axiosInstance.put(`${this.url}/${id}/aprovar-coordenador`);
    }
}