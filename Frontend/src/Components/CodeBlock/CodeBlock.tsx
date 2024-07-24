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
    const [user, setUser] = useState<UserModel>(() => {
        // Retrieve user data from session storage if available
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
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

        socketService.connect((message: MessageModel) => {

            //update the codeBlock to the updates one from server
            if (params._id === message.codeBlock._id)
                setCodeBlock(message.codeBlock);

            //if we got user from server and we not have one , set the new user
            if (message?.user && !userRef.current)
                setUser(message?.user);

            //if mentor disconnects from our codeBlock
            if (message?.isMentorDisconnect && message?.codeBlock?._id === codeBlockRef.current._id) {
                navigate(`/lobby`);
            }

            //if we got solution in our codeBlock
            if (message?.isCorrectSolution && message?.codeBlock?._id === codeBlockRef.current._id) {
                setOpenModal(true);
                setTimeout(() => { setOpenModal(false) }, 2000)
            }

        });

        //get initial codeBlock from HTTP request
        codeBlocksService.getOneCodeBlock(params._id)
            .then(c => { setCodeBlock(c) })
            .catch(err => notify.error(err))

        //when component unMount disconnect from socket
        return () => {
            const message = new MessageModel();
            sessionStorage.removeItem("user");
            message.codeBlock = codeBlockRef.current;
            message.user = userRef.current;
            socketService.disconnect(message);
        };

    }, [])

    //when code changes send the new code to server 
    function handleCodeMirrorChange(value: string): void {
        const message = new MessageModel();
        message.codeBlock = codeBlock;
        message.newCode = value;
        socketService.sendCode(message);
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
                    }}
                    options={{
                        mode: 'javascript',
                        theme: 'material',
                        lineNumbers: true,
                        readOnly: user?.role === RoleModel.Mentor ? true : false
                    }}
                    onChange={(editor, data, value) => {
                        handleCodeMirrorChange(value);
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