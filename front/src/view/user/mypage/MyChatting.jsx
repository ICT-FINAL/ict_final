import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function MyChatting() {
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    const [chatRoomList, setChatRoomList] = useState([]);
    const [sellerChatRoomList, setSellerChatRoomList] = useState([]);
    const [chatMenu, setChatMenu] = useState('');

    useEffect(()=>{
        getChatRoomList();
        getSellerChatRoomList();
    }, []);

    const getChatRoomList = ()=>{ // 구매자로서 문의한 내역
        axios.get(`${serverIP.ip}/chat/chatRoomList?role=buyer`,
            { headers: {Authorization: `Bearer ${user.token}`}})
        .then(res=>{
            console.log(res.data);
            setChatRoomList(res.data);
        })
        .catch(err=>console.log(err));
    }

    const getSellerChatRoomList = ()=>{ // 판매자가 받은 채팅 내역
        axios.get(`${serverIP.ip}/chat/chatRoomList?role=seller`,
            { headers: {Authorization: `Bearer ${user.token}`}})
        .then(res=>{
            console.log(res.data);
            setSellerChatRoomList(res.data);
        })
        .catch(err=>console.log(err));
    }

    return (
        <div>
            {/* <div className='follow-list'>
            {
                (selectedTab === "follower" ? followerList : followingList).map(user => (
                    <div key={user.id}>
                        <img className="follow-user-img" src = {user.profileImageUrl.indexOf('http') !==-1 ? `${user.profileImageUrl}`:`${serverIP.ip}${user.profileImageUrl}`} alt=''/>
                        <div id={`mgx-${user.id}`} className='message-who' style={{cursor: 'pointer'}}>{user.username}<span>{grade[user.grade]}</span></div>
                    </div>
                ))
            }
            </div>
            <ul className='chat-menu'>
                <li className={selectedTab === 'send' ? 'selected-menu' : {}} onClick={() => }>팔로워</li>
                <li className={selectedTab === 'receive' ? 'selected-menu' : {}} onClick={() => }>팔로잉</li>
            </ul> */}
            {
                chatRoomList.map((room, idx)=>{
                    return (
                        <div key={idx} className="chat-room" onClick={()=>navigate(`/product/chat/${room.chatRoomId}`)}>
                            <span><b>{room.product.sellerNo.username}</b></span>
                            <span className='date'>{room.createdAt}</span><br/>
                            <span></span>
                        </div>
                    )
                })
            }
            {
                sellerChatRoomList.map((room, idx)=>{
                    return (
                        <div key={idx} className="seller-chat-room" onClick={()=>navigate(`/product/chat/${room.chatRoomId}`)}>
                            <span><b>{room.buyer.username}</b></span>
                            <span className='date'>{room.createdAt}</span><br/>
                            <span></span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default MyChatting;