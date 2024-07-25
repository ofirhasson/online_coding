import { Socket, io } from "socket.io-client";
import CodeBlockModel from "../Models/CodeBlockModel";
import { MessageModel } from "../Models/MessageModel";
import { appConfig } from "../Utils/app-config";

class SocketService {

    private socket: Socket;

    public connectToCode(callback?: Function): void {
        this.socket = io(appConfig.backendUrl);
        this.socket.on("code", (message: MessageModel) => {
            if (callback) callback(message);
        });
    }

    public connectToJoin(callback?: Function): void {
        this.socket = io(appConfig.backendUrl);
        this.socket.on("join", (message: MessageModel) => {
            if (callback) callback(message);
        });
    }

    public connectToDisconnection(callback?: Function): void {
        this.socket = io(appConfig.backendUrl);
        this.socket.on("disconnection", (message: MessageModel) => {
            if (callback) callback(message);
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
    public disconnect(message: MessageModel): Promise<void> {
        return new Promise((resolve, reject) => {
            // Emit the disconnection message and provide a callback for acknowledgment
            this.socket?.emit("disconnection", message, (response: any) => {
                if (response.success) {
                    this.socket?.disconnect();
                    resolve();
                } else {
                    reject(new Error('Disconnection failed'));
                }
            });
        });
    }

}

export const socketService = new SocketService();
