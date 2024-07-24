import { Socket, io } from "socket.io-client";
import CodeBlockModel from "../Models/CodeBlockModel";
import { MessageModel } from "../Models/MessageModel";
import { appConfig } from "../Utils/app-config";

class SocketService {

    private socket: Socket;

    public connect(callback?: Function): void {

        //Client connect to server:
        this.socket = io(appConfig.backendUrl);

        //Client listens to server messages
        this.socket.on("code", (message: MessageModel) => {
            if (callback)
                callback(message);
        });

        this.socket.on("join", (message: MessageModel) => {
            if (callback)
                callback(message);
        });
        this.socket.on("disconnection", (message: MessageModel) => {
            if (callback)
                callback(message);
        });

    }

    //Client send code message to server:
    public sendCode(message: MessageModel): void {
        this.socket?.emit("code", message);
    }
    //Client send join message to server:
    public sendJoin(message: MessageModel): void {
        this.socket?.emit("join", message);
    }
    //Client send disconnection message to server:
    public disconnect(message: MessageModel): void {
        this.socket?.emit("disconnection", message);
        this.socket?.disconnect();
    }

}

export const socketService = new SocketService();
