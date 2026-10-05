import { axiosInstance, BaseService } from './BaseService';

export class OrientadorService extends BaseService {

    constructor(){
        super("/orientadores");
    }

    findMine(){
    return axiosInstance.get(`${this.url}/my`);
}

    importFromFile(file){
        return axiosInstance.post(`${this.url}/import`, file, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        });
    }
}