import { axiosInstance, BaseService } from './BaseService';

export class ProfessorTCCService extends BaseService {

    constructor() {
        super("/professores");
    }

    findMine() {
        return axiosInstance.get(`${this.url}/my`);
    }
}