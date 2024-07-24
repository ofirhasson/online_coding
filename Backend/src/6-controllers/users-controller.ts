import express, { NextFunction, Request, Response } from "express";
import { usersService } from "../5-services/users-service";

// Data controller:
class UsersController {

    // Create a router object for listening to HTTP requests:
    public readonly router = express.Router();

    // Register routes once: 
    public constructor() {
        this.registerRoutes();
    }

    // Register routes:
    private registerRoutes(): void {
        this.router.get("/user/:_id", this.getOneUser);
    }

    // GET http://localhost:4000/api/user/:id
    private async getOneUser(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const _id = request?.params?._id;
            const codeBlock = await usersService.getOneUser(_id);
            response.json(codeBlock);
        }
        catch (err: any) { next(err); }
    }
}

const usersController = new UsersController();
export const usersRouter = usersController.router;
