import { RoleModel } from "./RoleModel";

export class UserModel {
    _id:string
    codeBlockId: string
    nickname: string
    role: RoleModel
}