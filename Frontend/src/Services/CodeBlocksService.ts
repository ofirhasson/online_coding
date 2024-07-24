import axios from "axios";
import CodeBlockModel from "../Models/CodeBlockModel";
import { appConfig } from "../Utils/app-config";

class CodeBlocksService {
    public async getAllCodeBlocks(): Promise<CodeBlockModel[]> {
        const response = await axios.get<CodeBlockModel[]>(appConfig.backendUrl+"/api/code-blocks/");
        return response.data;
    }
    public async getOneCodeBlock(_id: string): Promise<CodeBlockModel> {
        
        const response = await axios.get<CodeBlockModel>(appConfig.backendUrl+"/api/code-block/" + _id);
        return response.data;
    }
}

export const codeBlocksService = new CodeBlocksService();
