import { ICodeBlockModel } from "./code-block-model";
import { IUserModel } from "./UserModel";

export class MessageModel {
    newCode: string;
    codeBlock: ICodeBlockModel;
    user:IUserModel;
    isMentorDisconnect:boolean;
    isCorrectSolution:boolean;
}