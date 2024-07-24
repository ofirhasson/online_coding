
import { UserModel } from "./UserModel";

class CodeBlockModel {
    public _id: string;
    public title: string;
    public initialCode: string;
    public writtenCode: string;
    public members: UserModel[];
    public solution: string;
}

export default CodeBlockModel;