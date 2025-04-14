import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import '../../css/view/chatting.css'

function Chatting() {

    const { roomId } = useParams();
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    const stompClientRef = useRef(null);
    const refDialogDiv = useRef();

    const [roomInfo, setRoomInfo] = useState({});
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(()=>{
        if (refDialogDiv.current) {
            refDialogDiv.current.scroll({
                top: refDialogDiv.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    },[chatHistory])

    useEffect(()=>{
        if (isOpen) {
            getRoomInfo();
            getChatList();
        }
    },[isOpen]);

    useEffect(()=> {
        getRoomInfo();
        getChatList();
        console.log(chatHistory);
    },[]);

    useEffect(()=>{
        const socket = new SockJS(`${serverIP.ip}/ws`);
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;

        stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
            stompClient.subscribe(`/topic/chat/${roomId}`, (msg)=>{
                const body = JSON.parse(msg.body);
                setChatHistory(prev => [...prev, body]);
                setIsOpen(true);
            });
        })

        return () => {
            stompClient.disconnect(() => {
                console.log('Disconnected from chat room');
            });
        };
    }, [roomId, serverIP, user.token]);

    const getRoomInfo =()=>{
        axios.get(`${serverIP.ip}/chat/getChatRoom/${roomId}`,
            { headers: {Authorization: `Bearer ${user.token}`}}
        )
        .then(res => {
            console.log(res.data);
            setRoomInfo(res.data);
        })
        .catch(err => console.log(err));
    }

    const getChatList = ()=> {
        axios.get(`${serverIP.ip}/chat/getChatList/${roomId}`,
            { headers: {Authorization: `Bearer ${user.token}`}}
        )
        .then(res => {
            console.log(res.data);
            setChatHistory(res.data);
        })
        .catch(err => console.log(err));
    }

    const sendMessage = useCallback((e)=>{
        e.preventDefault();
        if (stompClientRef.current && message.trim() !== '') {
            stompClientRef.current.send(`/app/chat/${roomId}`, {}, JSON.stringify({
                roomId: roomId,
                message: message,
                urd: { userid: user.user.userid }
            }));
            setMessage('');
        }
    },[message]);

    const getTime = (times)=>{
        const time = new Date(times);
        const month = (time.getMonth() + 1).toString().padStart(2, '0'); // 월 (1월은 0부터 시작하므로 +1)
        const day = time.getDate().toString().padStart(2, '0'); // 일
        const hour = time.getHours().toString().padStart(2, '0'); // 시
        const minute = time.getMinutes().toString().padStart(2, '0'); // 분

        return `${month}-${day} ${hour}:${minute}`;
    }

    return (
        <div style={{paddingTop: '100px'}}>
            {
                roomInfo.product &&
                <>
                    <div className='chat-header'>
                        <span>{roomInfo.product.productName}</span>
                    </div>
                    <div className="iphone-frame">
                        <div className='chat-container'>
                            <div className='chat-content' ref={refDialogDiv}>
                                {/* 프사, 읽음처리(가능하면), 문구 고민 */}
                                {
                                    roomInfo.state === "OPEN" ? "문의주세요" :
                                    chatHistory.map((history, idx)=>{
                                        return (
                                            <>
                                                <div key={idx} className={history.urd.id === user.user.id ? 'me' : 'other'}>
                                                    <span>{history.urd.username}</span>                                     
                                                    <span>{history.message}</span>
                                                </div>
                                                <span className={history.urd.id === user.user.id ? 'me-date' : 'other-date'}>{getTime(history.sendTime)}</span><br/>
                                            </>
                                        )
                                    })
                                }
                            </div>
                            <div className="chat-input">
                                <textarea id="chat-textarea"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                                <input type="button" value="보내기" id="chat-send-btn"
                                    onClick={sendMessage}
                                />
                            </div>
                        </div>
                        (<div className="home-button" onClick={()=> navigate(-1)}></div>)
                    </div>
                </>
            }
        </div>
    )
}

export default Chatting;