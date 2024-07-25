import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";
import { CodeBlockModel } from "../3-models/code-block-model";
import { MessageModel } from "../3-models/MessageModel";
import { RoleModel } from "../3-models/role-model";
import { UserModel } from "../3-models/UserModel";

class SocketService {

    public handleSocketMessages(httpServer: HttpServer): void {

        const options = {
            cors: { origin: "*" }
        };

        //create socket server:
        const socketServer = new SocketServer(httpServer, options);

        const normalizeCode = (code: string) => {
            return code.replace(/\s+/g, '');
        };

        socketServer.sockets.on("connection", (socket: Socket) => {

            //server listen to code message - new code has been entered
            socket.on("code", async (message: MessageModel) => {
                //update the codeBlock
                if (message.newCode && message.codeBlock) {
                    const newCodeBlock = await CodeBlockModel.findById(message?.codeBlock?._id).populate('members');
                    newCodeBlock.writtenCode = message.newCode;
                    newCodeBlock.save();

                    // Normalize both newCode and solution for comparison
                    const normalizedNewCode = normalizeCode(message.newCode);
                    const normalizedSolution = normalizeCode(newCodeBlock.solution);

                    if (normalizedNewCode === normalizedSolution) {
                        message.isCorrectSolution = true;
                    }

                    //send updated message to client
                    socketServer.sockets.emit("code", message);
                }
            });

            //server listen to join message - new user has been joined
            socket.on("join", async (message: MessageModel) => {
                if (message.codeBlock) {

                    const newCodeBlock = await CodeBlockModel.findById(message.codeBlock._id);

                    //create new user
                    const user = new UserModel(message.user);
                    await user.save();

                    //if he is the first one in this codeBlock - Mentor
                    if (!newCodeBlock.members || newCodeBlock.members.length === 0) {
                        user.role = RoleModel.Mentor;
                        newCodeBlock.members = [user._id];
                    }
                    //if not - Student
                    else {
                        user.role = RoleModel.Student;
                        newCodeBlock.members.push(user._id);
                    }
                    await newCodeBlock.save();

                    //update user
                    await UserModel.findByIdAndUpdate(user._id, user);

                    //update message
                    const updatedCodeBlock = await CodeBlockModel.findById(message.codeBlock._id).populate('members');
                    message.user = user;
                    message.codeBlock = updatedCodeBlock;

                    //send updated message to client
                    socketServer.sockets.emit("join", message);
                }
            });

            //server listen to disconnection message - user has been disconnect
            socket.on("disconnection", async (message: MessageModel) => {

                console.log("disconnection message",message);

                //check if the user exit from his codeBlock
                if (message?.user?.codeBlockId === message?.codeBlock?._id) {

                    const newCodeBlock = await CodeBlockModel.findById(message?.codeBlock?._id).populate('members');
                    if(newCodeBlock.writtenCode)
                        newCodeBlock.writtenCode = null;
   
                    //if student disconnects pull only him from members
                    if (message?.user?.role === RoleModel.Student) {
                        const userIndex = newCodeBlock.members.findIndex(m => m === message.user._id);
                        newCodeBlock.members.splice(userIndex, 1);
                        await UserModel.findByIdAndDelete(message?.user?._id);
                    }
                    //if mentor disconnects pull everyone from members
                    else if (message?.user?.role === RoleModel.Mentor) {
                        await UserModel.deleteMany({ _id: { $in: newCodeBlock.members } });
                        newCodeBlock.members = [];
                        message.isMentorDisconnect = true;
                    }
                    newCodeBlock.save();

                    console.log(newCodeBlock);
                    
                    //update message
                    message.codeBlock = newCodeBlock;
                    //send updated message to client
                    socketServer.sockets.emit("disconnection", message);
                }
            });

            //7.server listen to client disconnection:
            socket.on("disconnect", () => {
                console.log("client has been disconnected.");
            });

        })


    }

}

export const socketService = new SocketService();
