import { useContext, useEffect, useRef, useState } from 'react';
import './Chat.css'
import { AuthContext } from '../../Context/authContext';
import { makeRequest } from '../../utils/utils';
import Conversation from '../../Components/Conversation/Conversation';
import ChatBox from '../../Components/ChatBox/ChatBox';
import { io } from 'socket.io-client';
import Navbar from '../../Components/Navbar/Navbar';



const Chat = () => {

    const { user } = useContext(AuthContext);
    // console.log(user)
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [sendMessage, setSendMessage] = useState(null);
    const [receivedMessage, setReceivedMessage] = useState(null);

    const socket = useRef();

    // Connect to socket io server
    useEffect(() => {
        // Connect to socket io server
        socket.current = io("https://socialmedia.azurewebsites.net");
        socket.current?.emit("new-user-add", user.id);
        socket.current?.on("get-users", (users) => {
            setOnlineUsers(users);
        });

        // // receive message from socket server
        // socket.current?.on("receive-message", (data) => {
        //     setReceivedMessage(data);
        // });

        // // Clean up the socket connection when the component unmounts
        // return () => {
        //     socket.current.disconnect();
        // };
    }, [user]);

    // receive message from socket server
    useEffect(() => {
        socket.current.on("receive-message", (data) => {
            setReceivedMessage(data);
        });
    }, []);

    // Send Message to socket server
    useEffect(() => {
        if (sendMessage !== null) {
            socket.current.emit("send-message", sendMessage);
        }
    }, [sendMessage]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const data = await makeRequest.get('chats/' + user.id);
                const conversationsArray = Object.values(data); // Extract the array
                setConversations(...conversationsArray);
                console.log(...conversationsArray);
            } catch (err) {
                console.log(err);
            }
        };
        getConversations();
    }, [user.id]);

    const checkOnlineStatus = (chat) => {
        // Determine the other member's ID (not the current user's ID)
        const chatMember = chat.senderId === user.id ? chat.receiverId : chat.senderId;
        // Check if the 'chatMember' is present in the 'onlineUsers' array
        const online = onlineUsers.find((user) => user.userId === chatMember);
        return online ? true : false;
    };

    return (
        <>
            <Navbar />
            <div className="Chat">
                {/* Left-Side */}
                <div className="Left-side-chat">
                    <div className="Chat-container">
                        <input type="text" placeholder='search for friends...' style={{ border: "none", outline: "none", padding: "10px", borderRadius: "5px", borderBottom: "black" }} />
                        <h2>Chats</h2>
                        <div className="Chat-list">
                            {
                                conversations.map((conversation) => (
                                    <div key={conversation.id}
                                        onClick={() => setCurrentChat(conversation)}
                                    >
                                        <Conversation data={conversation} currentUser={user.id} online={checkOnlineStatus(conversation)} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                </div>
                {/* Right-Side */}
                <div className="Right-side-chat">
                    <div style={{ width: "90%" }}>
                        {/* Chat Body */}
                        <ChatBox
                            chat={currentChat}
                            currentUser={user.id}
                            setSendMessage={setSendMessage}
                            receivedMessage={receivedMessage}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chat