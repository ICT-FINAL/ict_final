import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

function MyChatting() {
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedTab = searchParams.get('tab') || 'send';
    const stompClientRef = useRef(null);

    const [chatRoomList, setChatRoomList] = useState([]);
    const [sellerChatRoomList, setSellerChatRoomList] = useState([]);
    const [isMessage, setIsMessage] = useState(false);
    
    useEffect(()=>{
        getChatRoomList();
        getSellerChatRoomList();
        console.log("!!!!");
    }, [isMessage]);

    const getChatRoomList = ()=>{ // 구매자로서 문의한 내역
        axios.get(`${serverIP.ip}/chat/chatRoomList?role=buyer`,
            { headers: {Authorization: `Bearer ${user.token}`}})
        .then(res=>{
            console.log(res.data);
            setChatRoomList(res.data);
            res.data.map(room=>{
                console.log(room);
                const socket = new SockJS(`${serverIP.ip}/ws`);
                const stompClient = Stomp.over(socket);
                stompClientRef.current = stompClient;
    
                stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
                    stompClient.subscribe(`/topic/chat/${room.chatRoomId}`, (msg)=>{
                        setIsMessage(!isMessage);
                    });
                })
            })
        })
        .catch(err=>console.log(err));
    }

    const getSellerChatRoomList = ()=>{ // 판매자가 받은 채팅 내역
        axios.get(`${serverIP.ip}/chat/chatRoomList?role=seller`,
            { headers: {Authorization: `Bearer ${user.token}`}})
        .then(res=>{
            console.log(res.data);
            setSellerChatRoomList(res.data);
            res.data.map(room=>{
                console.log(room);
                const socket = new SockJS(`${serverIP.ip}/ws`);
                const stompClient = Stomp.over(socket);
                stompClientRef.current = stompClient;
    
                stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
                    stompClient.subscribe(`/topic/chat/${room.chatRoomId}`, (msg)=>{
                        setIsMessage(!isMessage);
                    });
                })
            })
        })
        .catch(err=>console.log(err));
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
        <div>
            <ul className='chat-menu'>
                <li className={selectedTab === 'send' ? 'selected-menu' : {}} onClick={() => navigate('?tab=send')}>구매 문의</li>
                <li className={selectedTab === 'receive' ? 'selected-menu' : {}} onClick={() => navigate('?tab=receive')}>판매 문의</li>
            </ul>
            {
                (selectedTab === 'send' && chatRoomList.length === 0) ||
                (selectedTab === 'receive' && sellerChatRoomList.length === 0) ? (
                    <div style={{padding: '50px', textAlign: 'center'}}>진행 중인 채팅이 없습니다.</div>
                ) : null
            }
            {
                (selectedTab === 'send' ? chatRoomList : sellerChatRoomList).map((room, idx)=>{
                    const selectedUser = selectedTab === 'send' ? room.product.sellerNo : room.buyer
                    return (
                        <div key={idx} className="chat-room" onClick={()=>navigate(`/product/chat/${room.chatRoomId}`)}
                            style={room.lastChat.read || room.lastChat.sender.id === user.user.id ? {background: '#f7f7f7'} : {}}>
                            <img className="chat-user-img" style={{width: '80px', height: '80px'}} src = {selectedUser.profileImageUrl.indexOf('http') !==-1 ? `${selectedUser.profileImageUrl}`:`${serverIP.ip}${selectedUser.profileImageUrl}`} alt=''/>
                            <div style={{display: 'flex', flexDirection: 'column', paddingLeft: '3%', width: '95%'}}>
                                <div>
                                    <span><b>{selectedUser.username}</b></span>
                                    <span className='date'>{getTime(room.lastChat.sendTime)}</span><br/>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '90%'
                                }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '90%' }}>
                                        {room.lastChat.message}
                                    </span>
                                    {
                                        !room.lastChat.read && room.lastChat.sender.id !== user.user.id &&
                                        <span id="new-chat-sticker">new</span>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default MyChatting;