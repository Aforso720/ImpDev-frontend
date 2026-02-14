import { axiosWithAuth } from "../api/interceptors";
import { IUser } from "../types";

class UtilsService {
    async getByIdPublic(id:string):Promise<IUser>{
        const response = await axiosWithAuth.get<IUser>(`/user/${id}`)
        return response.data
    }
}

export const utilsService = new UtilsService()