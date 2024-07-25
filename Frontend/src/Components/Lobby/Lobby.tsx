import { useEffect, useState } from "react";
import "./Lobby.css";
import CodeBlockModel from "../../Models/CodeBlockModel";
import { codeBlocksService } from "../../Services/CodeBlocksService";
import { notify } from "../../Utils/Notify";
import { useNavigate } from "react-router-dom";
import { MessageModel } from "../../Models/MessageModel";
import { socketService } from "../../Services/SocketService";
import { UserModel } from "../../Models/UserModel";

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

    const handleClick = (_id: string) => {
        //check if nickname entered
        if (!nickname.trim()) {
            setError("Nickname is required.");
            return;
        }
        setError(null);

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
