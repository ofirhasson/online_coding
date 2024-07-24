import { IUserModel, UserModel } from "../3-models/UserModel";

class UsersService {
    
    public async getOneUser(_id:string): Promise<IUserModel> {
        const user = await UserModel.findById(_id).exec();
        return user;
    }
}

export const usersService = new UsersService();
