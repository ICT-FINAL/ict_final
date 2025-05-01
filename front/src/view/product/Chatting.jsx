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
        if (user) {
            if (refDialogDiv.current) {
                refDialogDiv.current.scroll({
                    top: refDialogDiv.current.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    },[chatHistory])

    useEffect(()=>{
        if (user) {
            if (isOpen) {
                getRoomInfo();
                getChatList();
            }
        }
    },[isOpen]);

    useEffect(()=>{
        if (user) {
            const socket = new SockJS(`${serverIP.ip}/ws`);
            const stompClient = Stomp.over(socket);
            stompClientRef.current = stompClient;

            stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
                stompClient.subscribe(`/topic/chat/${roomId}`, (msg)=>{
                    const body = JSON.parse(msg.body);
                    setChatHistory(prev => [...prev, body]);
                    setIsOpen(true);
                    if (body.urd.id != user.user.id) {
                        changeReadState(body.id);
                    }
                    stompClient.send(`/app/chat/read/${roomId}`, {}, JSON.stringify({
                        roomId: roomId,
                        urd: { userid: user.user.userid }
                    }));
                });
                stompClient.subscribe(`/topic/chat/read/${roomId}`, (msg)=>{
                    changeAllReadState();
                });
                stompClient.send(`/app/chat/read/${roomId}`, {}, JSON.stringify({
                    roomId: roomId,
                    urd: { userid: user.user.userid }
                }));
            })
            return () => {
                stompClient.disconnect(() => {
                    //추후 구현현
                });
            };
        }
        
    }, [roomId, serverIP, user?.token]);

    const getRoomInfo =()=>{
        axios.get(`${serverIP.ip}/chat/getChatRoom/${roomId}`,
            { headers: {Authorization: `Bearer ${user.token}`}}
        )
        .then(res => {
            setRoomInfo(res.data);
        })
        .catch(err => console.log(err));
    }

    const getChatList = ()=> {
        axios.get(`${serverIP.ip}/chat/getChatList/${roomId}`,
            { headers: {Authorization: `Bearer ${user.token}`}}
        )
        .then(res => {
            setChatHistory(res.data);
        })
        .catch(err => console.log(err));
    }

    const changeReadState = (chatId)=>{
        axios.post(`${serverIP.ip}/chat/read/${chatId}`, null, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(()=>{
            getChatList();
        }).catch(err => {
        console.error('읽음 처리 실패', err);
        });
    }
    const changeAllReadState = ()=>{
        axios.post(`${serverIP.ip}/chat/read/room/${roomId}`, null, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(()=>{
            setTimeout(() => {
                getRoomInfo();
                getChatList();
              }, 100);
        }).
        catch(err => {
            console.error('읽음 처리 실패', err);
        });
    }

    const sendMessage = useCallback((e)=>{
        if (user) {
            e.preventDefault();
            if (stompClientRef.current && message.trim() !== '') {
                stompClientRef.current.send(`/app/chat/${roomId}`, {}, JSON.stringify({
                    roomId: roomId,
                    message: message,
                    urd: { userid: user.user.userid }
                }));
                setMessage('');
            }
        }
    },[message]);
    
    const leaveChatRoom = ()=>{
        if (window.confirm("채팅방을 나가시겠습니까?")) {
            axios.post(`${serverIP.ip}/chat/leaveChatRoom/${roomId}`, null, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(()=>{
                stompClientRef.current.send(`/app/chat/read/${roomId}`, {}, JSON.stringify({
                    roomId: roomId,
                    urd: { userid: user.user.userid }
                }));
                navigate(-1);
            })
            .catch(err=>console.log(err));
        }
    }

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
                user &&
                <>
                    <div className="iphone-frame">
                        <div className='chat-container'>
                            {
                                roomInfo.state !== 'CLOSED' &&
                                <div style={{padding: '10px', display: 'flex', alignItems: 'center'}}>
                                    <div style={{width: 'calc(100% - 60px)'}}><b style={{fontSize: '12pt'}}>{roomInfo.product?.productName}</b></div>
                                    {
                                        <div style={{width: '60px'}}><span style={{width: '50px', float: 'right', textAlign: 'center', padding: '5px', background: '#e54d4b', color: '#fff', borderRadius: '10px', fontSize: '10pt', cursor: 'pointer'}}
                                            onClick={leaveChatRoom}>나가기</span></div>
                                    }
                                </div>
                            }
                            <div className="chat-display" ref={refDialogDiv}>
                                {
                                    roomInfo.state === "OPEN"
                                    ?
                                    roomInfo.product &&
                                    <div id="info-message">
                                        💬 작품 관련 궁금한 점이 있다면 편하게 문의해 주세요.<br/>
                                        ⏱ 판매자는 최대한 빠르게 답변드릴게요.<br/>
                                        🤝 서로를 존중하며 예의 있게 대화해 주세요.<br/>
                                        🚫 부적절한 언행은 제재될 수 있어요.
                                    </div>
                                    :
                                    chatHistory.map((history, idx)=>{
                                        const isMe = history.urd.id === user.user.id;
                                        return (
                                            <div className='chat-content'>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                                    alignItems: 'flex-end',
                                                    gap: '8px',
                                                    marginBottom: '10px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <img className="chat-user-img" src={history.urd.imgUrl.indexOf('http') !== -1 ? history.urd.imgUrl : `${serverIP.ip}${history.urd.imgUrl}`} alt='' />
                                                        <span className='message-who' id = {isMe ? `mgx-${user.user.id}`: `mgx-${history.urd.id}`} style={{fontWeight:'bold', fontSize:'10pt', cursor:'pointer'}}>{history.urd.username}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                        <div className={isMe ? 'me' : 'other'} style={{maxWidth:'250px'}}>{history.message}</div>
                                                        <div className={isMe ? 'me-date' : 'other-date'}>{getTime(history.sendTime)}</div>
                                                        {
                                                            !history.read &&
                                                            <span id='unread-sticker'>읽지 않음</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    roomInfo.state === 'LEFT' &&
                                    <div style={{textAlign: 'center', padding: '10px', color: '#555'}}>
                                        - {user.user.id === roomInfo.participantA.id ? roomInfo.participantB.username : roomInfo.participantA.username}님이 방을 나가셨습니다 -
                                    </div> 
                                }
                            </div>
                            <div className="chat-input">
                                <textarea id="chat-textarea"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => {if (e.key === 'Enter') {sendMessage(e);}}}
                                    disabled={roomInfo.state === 'LEFT'}
                                />
                                <input type="button" value="보내기" id="chat-send-btn"
                                    onClick={sendMessage}
                                    disabled={roomInfo.state === 'LEFT'}
                                />
                            </div>
                        </div>
                        <div className="home-button" onClick={()=> navigate(-1)}></div>
                    </div>
                </>
            }
        </div>
    )
}

export default Chatting;