import { useParams,useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AuctionRoom() {
    const { roomId } = useParams();
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);

    const navigate = useNavigate();

    const stompClientRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputPrice, setInputPrice] = useState('');

    const [isConnected, setIsConnected] = useState(false);

    const [bidHistory, setBidHistory] = useState([]);

    useEffect(() => {
        const socket = new SockJS(`${serverIP.ip}/ws`);
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;
    
        stompClient.connect({ Authorization: `Bearer ${user.token}` }, () => {
            stompClient.subscribe(`/topic/auction/${roomId}`, (message) => {
                const body = JSON.parse(message.body);
                console.log(body);
                setMessages(prev => [...prev, body]);
                setBidHistory(prev => [...prev, {
                    username: body.urd.username,
                    price: body.price,
                    bidTime: new Date().toISOString() //추후 정렬용
                }]);
            });

            stompClient.subscribe(`/topic/auction/${roomId}/end`, (message) => {
                alert('경매가 종료되었습니다..');
                navigate('/auction');
            });
    
            setIsConnected(true);
        });
    
        return () => {
            stompClient.disconnect(() => {
                console.log('Disconnected from auction room');
            });
        };
    }, [roomId, serverIP, user.token]);

    useEffect(() => {
        const fetchPreviousBids = async () => {
            try {
                const res = await axios.get(`${serverIP.ip}/auction/bids/${roomId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
    
                const formattedBids = res.data.map(bid => ({
                    username: bid.user.username,
                    price: bid.price,
                    bidTime: new Date().toISOString(), // 정렬 용도
                }));
    
                setBidHistory(formattedBids);
            } catch (err) {
                console.error('입찰 내역 불러오기 실패', err);
            }
        };
    
        fetchPreviousBids();
    }, [roomId]);

    const sendBid = () => {
        const client = stompClientRef.current;
    
        if (client && client.connected) {
            const payload = {
                username: user.username,
                price: inputPrice,
            };
    
            client.send(
                `/app/auction/${roomId}`,
                {},
                JSON.stringify({ userid: user.user.userid, price: inputPrice })
            );
            setInputPrice('');
        } else {
            console.warn('STOMP 연결이 아직 완료되지 않았습니다.');
        }
    };

    return (
        <div style={{ paddingTop: '100px', textAlign: 'center' }}>
            <h2>경매방: {roomId}</h2>

            <div>
                <input
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    placeholder="입찰 금액 입력"
                    style={{ padding: '8px', marginRight: '10px', borderRadius: '4px' }}
                />
                <button onClick={sendBid} style={{ padding: '8px 16px', backgroundColor: '#8CC7A5', border: 'none', color: 'white', borderRadius: '4px' }}>
                    입찰
                </button>
            </div>
            <p>{isConnected ? "연결됨" : "연결 중..."}</p>
            <div style={{ marginTop: '30px' }}>
                <h3>실시간 입찰 내역</h3>
                <ul>
                    { bidHistory && bidHistory.map((bid, idx) => (
                        <li key={idx}>
                        {bid.username}: {bid.price}원
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AuctionRoom;