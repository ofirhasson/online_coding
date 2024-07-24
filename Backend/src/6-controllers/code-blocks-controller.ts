import express, { NextFunction, Request, Response } from "express";
import { codeBlocksService } from "../5-services/code-blocks-service";

// Data controller:
class CodeBlocksController {

    // Create a router object for listening to HTTP requests:
    public readonly router = express.Router();

    // Register routes once: 
    public constructor() {
        this.registerRoutes();
    }

    // Register routes:
    private registerRoutes(): void {
        this.router.get("/code-blocks", this.getAllCodeBlocks);
        this.router.get("/code-block/:_id", this.getOneCodeBlock);
    }

    // GET http://localhost:4000/api/code-blocks
    private async getAllCodeBlocks(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const codeBlocks = await codeBlocksService.getAllCodeBlocks();
            response.json(codeBlocks);
        }
        catch (err: any) { next(err); }
    }
    // GET http://localhost:4000/api/code-block/:id
    private async getOneCodeBlock(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const _id = request?.params?._id;
            const codeBlock = await codeBlocksService.getOneCodeBlock(_id);
            response.json(codeBlock);
        }
        catch (err: any) { next(err); }
    }
}

const codeBlocksController = new CodeBlocksController();
export const codeBlocksRouter = codeBlocksController.router;
