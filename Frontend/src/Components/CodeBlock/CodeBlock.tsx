import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { Box, Button, Menu, MenuItem, Modal } from "@mui/material";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';
import { useEffect, useRef, useState } from "react";
import { Controlled as CodeMirror } from 'react-codemirror2';
import { useNavigate, useParams } from "react-router-dom";
import CodeBlockModel from "../../Models/CodeBlockModel";
import { MessageModel } from "../../Models/MessageModel";
import { RoleModel } from "../../Models/RoleModel";
import { UserModel } from "../../Models/UserModel";
import { codeBlocksService } from "../../Services/CodeBlocksService";
import { socketService } from "../../Services/SocketService";
import { notify } from "../../Utils/Notify";
import "./CodeBlock.css";
import { Editor } from 'codemirror';

//style for mui modal
const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    border: "none",
    p: 4,
};

export function CodeBlock(): JSX.Element {

    const [codeBlock, setCodeBlock] = useState<CodeBlockModel>(null);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [user, setUser] = useState<UserModel>(() => {
        // Retrieve user data from session storage if available
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [newCode, setNewCode] = useState<string>("");
    const [isUserInput, setIsUserInput] = useState<boolean>(false);
    const [isServerUpdate, setIsServerUpdate] = useState<boolean>(false);

    //handle mui modal
    const [openModal, setOpenModal] = useState<boolean>(false);

    const codeBlockRef = useRef<CodeBlockModel>(null);
    const userRef = useRef<UserModel>(null);

    const params = useParams();
    const navigate = useNavigate();

    //handle mui menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    //save the last codeBlock
    useEffect(() => {
        codeBlockRef.current = codeBlock;
    }, [codeBlock]);

    //save the last user 
    useEffect(() => {
        userRef.current = user;
        // Save user data to session storage whenever it changes
        sessionStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        const handleCodeMessage = (message: MessageModel) => {
            console.log("code message", message);
            console.log(message.typedUserId, userRef?.current?._id);
            console.log(((message.typedUserId === userRef?.current?._id && newCode === message.newCode)
                || message.typedUserId !== userRef?.current?._id || !message.typedUserId));


            if (params._id === message.codeBlock._id &&
                ((message.typedUserId === userRef?.current?._id && newCode === message.newCode)
                    || message.typedUserId !== userRef?.current?._id || !message.typedUserId)) {
                setIsServerUpdate(true);
                setCodeBlock(prevCodeBlock => ({
                    ...prevCodeBlock,
                    writtenCode: message.codeBlock.writtenCode
                }));
            }

            if (message?.isCorrectSolution && message?.codeBlock?._id === codeBlockRef?.current?._id) {
                setOpenModal(true);
                setTimeout(() => { setOpenModal(false) }, 2000)
            }
        };

        const handleJoinMessage = (message: MessageModel) => {
            // Handle join message
            if (params._id === message.codeBlock._id)
                setCodeBlock(message.codeBlock);

            if (message?.user && !userRef.current) {
                setUser(message?.user);
            }

        };

        const handleDisconnectionMessage = (message: MessageModel) => {
            if (params._id === message.codeBlock._id)
                setCodeBlock(message.codeBlock);
            // Handle disconnection message
            if (message?.isMentorDisconnect && message?.codeBlock?._id === codeBlockRef?.current?._id) {
                navigate(`/lobby`);
            }
        };

        socketService.connectToCode(handleCodeMessage);
        socketService.connectToJoin(handleJoinMessage);
        socketService.connectToDisconnection(handleDisconnectionMessage);

        //get initial codeBlock from HTTP request
        if (!codeBlock)
            codeBlocksService.getOneCodeBlock(params._id)
                .then(c => { setCodeBlock(c) })
                .catch(err => notify.error(err))

        //when component unMount , disconnect from socket
        return () => {
            console.log("Component unmounting, cleaning up...");
            const message = new MessageModel();
            sessionStorage.removeItem("user");
            console.log("Session storage cleared");

            message.codeBlock = codeBlockRef.current;
            message.user = userRef.current;
            if (userRef.current.role === RoleModel.Mentor)
                message.isMentorDisconnect = true;
            console.log("Message prepared for disconnect:", message);

            socketService.disconnect(message);
            console.log("Socket disconnected");
        };

    }, [])

    // When code changes send the new code to server after stopped typing
    function handleCodeMirrorChange(editor: Editor, value: string): void {
        setIsUserInput(true);
        setNewCode(value);
        // Clear the previous timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Set a new timeout
        const newTimeoutId = setTimeout(() => {
            if (user?.role !== RoleModel.Mentor) {
                const message = new MessageModel();
                message.codeBlock = codeBlock;
                message.newCode = value;
                message.typedUserId = user?._id;
                socketService.sendCode(message);
            }
            setIsUserInput(false);
        }, 500);

        setTimeoutId(newTimeoutId);
    }
    return (
        <div className="CodeBlock">
            <div>
                <p>{codeBlock?.title}</p>
            </div>
            <div>
                <span style={{ color: user?.role === RoleModel.Mentor ? 'red' : user?.role === RoleModel.Student ? 'green' : 'black' }}>
                    {user?.nickname} - {user?.role}
                </span>
                {/* menu for members list */}
                <Box>
                    <Button
                        aria-controls="members-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                        sx={{ color: 'black', fontWeight: 'bold', borderColor: 'black', width: "400px", backgroundColor: 'white' }}
                        variant="outlined"
                    >
                        Number of students - {codeBlock?.members?.length ? codeBlock.members.length - 1 : 0}
                    </Button>
                    <Menu
                        id="members-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {codeBlock?.members?.map(member => (
                            <MenuItem key={member._id} onClick={handleClose}
                                style={{
                                    color:
                                        member.role === RoleModel.Mentor ? 'red' :
                                            member.role === RoleModel.Student ? 'green' :
                                                'black'
                                }}>
                                {member.nickname} - {member.role}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </div>
            <div>
                <CodeMirror
                    value={codeBlock?.writtenCode ? codeBlock?.writtenCode : codeBlock?.initialCode}
                    onBeforeChange={(editor, data, value) => {
                        if (codeBlock) {
                            setCodeBlock({ ...codeBlock, writtenCode: value });
                        }
                        setIsServerUpdate(false);
                    }}
                    options={{
                        mode: 'javascript',
                        theme: 'material',
                        lineNumbers: true,
                        readOnly: user?.role === RoleModel.Mentor ? true : false
                    }}
                    onChange={(editor, data, value) => {
                        if (!isServerUpdate) {
                            handleCodeMirrorChange(editor, value);
                        }
                    }}
                />
            </div>

            <button onClick={() => navigate('/lobby')}>Return to lobby</button>

            {/* smiley modal */}
            <Modal open={openModal}
                BackdropProps={{
                    style: {
                        backgroundColor: 'transparent',
                    },
                }}>
                <Box sx={style}>
                    <SentimentSatisfiedAltIcon
                        sx={{ fontSize: 400 }}
                        color="success"
                    />
                </Box>
            </Modal>


        </div>


    );
}
