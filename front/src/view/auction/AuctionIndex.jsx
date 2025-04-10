import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AuctionIndex() {
    const navigate = useNavigate();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [rooms, setRooms] = useState([]);
    const [subject,setSubject] = useState('');

    const changeSubject = (e) => {
        setSubject(e.target.value);
    }

    // 방 생성
    const createAuctionRoom = async () => {
        console.log(user.user);
        try {
            const res = await axios.get(`${serverIP.ip}/auction/createRoom?subject=${subject}&userid=${user.user.userid}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const roomId = res.data.roomId;
            navigate(`/auction/room/${roomId}`);
        } catch (err) {
            console.error('경매 방 생성 실패', err);
        }
    };

    // 방 목록 불러오기
    const fetchRooms = async () => {
        try {
            const res = await axios.get(`${serverIP.ip}/auction/rooms`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRooms(res.data);
        } catch (err) {
            console.error('방 목록 불러오기 실패', err);
        }
    };

    const deleteRoom = async (roomId) => {
        if (window.confirm("정말 이 방을 삭제하시겠습니까?")) {
            try {
                await axios.get(`${serverIP.ip}/auction/room/delete/${roomId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                alert("방이 삭제되었습니다.");
                setRooms(prev => prev.filter(r => r.roomId !== roomId));
            } catch (err) {
                console.error("삭제 실패", err);
            }
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const moveAuctionWrite = () => {
        navigate('/auction/sell');
    }

    return (
        <div style={{ paddingTop: '100px', textAlign: 'center' }}>
            <h1>실시간 경매 시스템</h1>
            방 제목:<input type="text" value={subject} onChange={changeSubject}/><br/>
            <button onClick={createAuctionRoom} style={{
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#8CC7A5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
            }}>
                경매 방 만들기
            </button>
            <button onClick={()=>moveAuctionWrite()}>
                경매 물품 등록
            </button>
            <div style={{ marginTop: '50px' }}>
                <h2>현재 개설된 경매 방</h2>
                {rooms.length === 0 ? (
                    <p>아직 생성된 방이 없습니다.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {rooms.map((room) => (
                            <>
                            <li key={room.roomId} style={{
                                margin: '10px 0',
                                padding: '15px',
                                backgroundColor: '#f4f4f4',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }} onClick={() => navigate(`/auction/room/${room.roomId}`)}>
                                방 제목: <strong>{room.subject}</strong><br />
                                작성자: <strong>{}</strong><br />
                                생성 시간: {new Date(room.createdAt).toLocaleString()}<br/>
                                마감 시간: {new Date(room.endTime).toLocaleString()}
                            </li>
                            <button onClick={() => deleteRoom(room.roomId)}>삭제</button>
                            </>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default AuctionIndex;