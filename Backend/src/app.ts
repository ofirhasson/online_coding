import cors from "cors";
import express from "express";
import { appConfig } from "./2-utils/app-config";
import { dal } from "./2-utils/dal";
import { socketService } from "./5-services/socket-service";
import { codeBlocksRouter } from "./6-controllers/code-blocks-controller";
import { usersRouter } from "./6-controllers/users-controller";
import { errorsMiddleware } from "./4-middleware/errors-middleware";

// Main application class:
class App {

    // Express server: 
    private server = express();

    // Start app:
    public async start(): Promise<void> {

        // Enable CORS requests:
        this.server.use(cors());

        // Connect any controller route to the server:
        this.server.use("/api", codeBlocksRouter, usersRouter);

        // Route not found middleware: 
        this.server.use(errorsMiddleware.routeNotFound);

        // Catch all middleware: 
        this.server.use(errorsMiddleware.catchAll);

        // Connect to MongoDB: 
        await dal.connect();

        // Run server:
        const httpServer = this.server.listen(appConfig.port, () => console.log("Listening on http://localhost:" + appConfig.port));

        //run sockets:
        socketService.handleSocketMessages(httpServer);
    }

}

const app = new App();
app.start();
