import CodeBlockModel from "./CodeBlockModel";
import { UserModel } from "./UserModel";

export class MessageModel {
    newCode: string;
    codeBlock: CodeBlockModel;
    user: UserModel;
    isMentorDisconnect: boolean;
    isCorrectSolution: boolean;
}