import axios from "axios";
import { UserModel } from "../Models/UserModel";
import { appConfig } from "../Utils/app-config";

class UsersService {
    public async getOneUser(_id: string): Promise<UserModel> {
        const response = await axios.get<UserModel>(appConfig.backendUrl+"/api/user/" + _id);
        return response.data;
    }
}

export const usersService = new UsersService();
