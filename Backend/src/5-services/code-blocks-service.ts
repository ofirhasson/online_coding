import { CodeBlockModel, ICodeBlockModel } from "../3-models/code-block-model";

class CodeBlocksService {
    public async getAllCodeBlocks(): Promise<ICodeBlockModel[]> {
        const codeBlocks = await CodeBlockModel.find().populate("members").exec();
        return codeBlocks;
    }
    public async getOneCodeBlock(_id:string): Promise<ICodeBlockModel> {
        const codeBlock = await CodeBlockModel.findById(_id).exec();
        return codeBlock;
    }
}

export const codeBlocksService = new CodeBlocksService();
