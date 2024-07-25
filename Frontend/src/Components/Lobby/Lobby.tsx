import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeBlockModel from "../../Models/CodeBlockModel";
import { MessageModel } from "../../Models/MessageModel";
import { RoleModel } from "../../Models/RoleModel";
import { UserModel } from "../../Models/UserModel";
import { codeBlocksService } from "../../Services/CodeBlocksService";
import { socketService } from "../../Services/SocketService";
import { notify } from "../../Utils/Notify";
import "./Lobby.css";

export function Lobby(): JSX.Element {

    const [codeBlocks, setCodeBlocks] = useState<CodeBlockModel[]>([]);
    const [nickname, setNickname] = useState<string>("");
    const [error, setError] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        //get all code blocks from HTTP request
        codeBlocksService.getAllCodeBlocks()
            .then(codeBlocks => setCodeBlocks(codeBlocks))
            .catch(err => notify.error(err))
    }, [])

    const handleClick = async (_id: string) => {
        //check if nickname entered
        if (!nickname.trim()) {
            setError("Nickname is required.");
            return;
        }
        setError(null);

        //check if mentor exists in another room
        const newCodeBlocks = await codeBlocksService.getAllCodeBlocks();
        const existingMentor = newCodeBlocks.find(c => c.members.some(m => m.role === RoleModel.Mentor));
        if (existingMentor && existingMentor._id !== _id) {
            notify.error("Mentor already exists in another room!");
            return;
        }

        //build and send join message to the server
        socketService.connectToJoin();
        const message = new MessageModel();
        message.codeBlock = new CodeBlockModel();
        message.user = new UserModel();
        message.user.nickname = nickname;
        message.user.codeBlockId = _id;
        message.codeBlock._id = _id;
        socketService.sendJoin(message);
        
        navigate(`/code-block/${_id}`);
    };

    const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setNickname(event.target.value);
    };

    return (
        <div className="Lobby">
            <div>
                <p>Choose code block</p>
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={nickname}
                    onChange={handleNicknameChange}
                    placeholder="Enter your nickname"
                />
                {error && <p className="error-message">{error}</p>}
            </div>
            <div>
                {codeBlocks.map(c =>
                    <button key={c._id} onClick={() => handleClick(c._id)}>
                        {c.title}
                    </button>
                )}
            </div>
        </div>
    );
}
