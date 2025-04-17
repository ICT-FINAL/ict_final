import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { setSearch } from "../../store/searchSlice";
import { setModal } from "../../store/modalSlice";
import useDebounce from "../../effect/useDebounce";

function AuctionSearch() {
    const search = useSelector((state) => state.search);
    const [products, setProducts] = useState([]);
    const [nowPage, setNowPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const debouncedSearchWord = useDebounce(search.searchWord, 500);

    const eventOptions = ["생일", "결혼", "졸업", "시험", "출산", "기타"];
    const targetOptions = ["여성", "남성", "연인", "직장동료", "부모님", "선생님", "기타"];
    const productOptions = {
        "디저트": ["베이커리", "떡", "초콜릿", "음료"],
        "수제먹거리": ["건강식품", "간편식", "가공식품", "반찬", "소스/장류"],
        "농축수산물": ["과일/채소", "잡곡/견과", "정육/계란", "수산물"],
        "의류": ["홈웨어/언더웨어", "티셔츠/니트", "바지/스커트", "아우터"],
        "패션잡화": ["신발", "모자", "가방", "지갑"],
        "홈인테리어": ["가구", "꽃", "캔들", "홈데코"],
        "주방/생활": ["주방용품", "욕실"],
        "케이스": ["폰케이스", "노트북케이스"],
        "문구": ["인형", "장난감", "다이어리", "노트", "필기도구"],
        "일러스트/사진": ["드로잉", "사진"],
        "화장품": ["네일", "메이크업", "향수"],
        "기타": ["기타"]
    };

    const { ref, inView } = useInView({
        threshold: 0.5, // 50% 보이면
    });

    useEffect(() => {
        setProducts([]);
        setNowPage(1);
        getAuctionList(1);
    }, [debouncedSearchWord, search.eventCategory, search.targetCategory, search.productCategory]);

    useEffect(() => {
        if (nowPage > 1) {
            getAuctionList(nowPage);
        }
    }, [nowPage]);

    useEffect(() => {
        if (inView && nowPage < totalPage) {
            setNowPage((prevPage) => prevPage + 1);
        }
    }, [inView, totalPage]);

    const moveInfo = (id) => {
        navigate(`/auction/room/${id}`);
    }

    const changeSearchWord = (e) => {
        dispatch(setSearch({ ...search, searchWord: e.target.value }));
    }

    const getAuctionList = (page) => {
        axios
            .get(
                `${serverIP.ip}/auction/search?searchWord=${search.searchWord}&eventCategory=${search.eventCategory}&targetCategory=${search.targetCategory}&productCategory=${search.productCategory}&nowPage=${page}`,
            )
            .then((res) => {
                const { pvo, auction } = res.data;
                
                setProducts((prev) => {
                    if (page === 1) return auction;
                    return [...prev, ...auction];
                });

                setTotalPage(pvo.totalPage);
            })
            .catch((err) => {
                console.log(err)
            });
    };

    const isEndingSoon = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = (end - now) / (1000 * 60 * 60);
        return diff <= 2;
    };

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}｜${hours}:${minutes}`;
    };

    return (
        <div className="product-grid-container">
            <h2 style={{ fontSize: '28px' }}>{search.searchWord && `'${search.searchWord}'`} 상품 검색 결과</h2>
            <div style={{ maxWidth: '1200px', margin: 'auto' }}>
                <div className="search-options-container">
                    <select
                        value={search.eventCategory}
                        onChange={(e) => dispatch(setSearch({ ...search, eventCategory: e.target.value }))}
                        className="search-selectbox-style"
                    >
                        <option value="">이벤트 선택</option>
                        {eventOptions.map((event, index) => (
                            <option key={index} value={event}>{event}</option>
                        ))}
                    </select>

                    <select
                        value={search.targetCategory}
                        onChange={(e) => dispatch(setSearch({ ...search, targetCategory: e.target.value }))}
                        className="search-selectbox-style"
                    >
                        <option value="">대상 선택</option>
                        {targetOptions.map((target, index) => (
                            <option key={index} value={target}>{target}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => dispatch(setModal({
                            ...modal,
                            isOpen: true,
                            selected: "categorymodal",
                            info: productOptions,
                        }))}
                        className="search-selectbox-style"
                        style={{
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                        }}
                    >
                        {search.productCategory.length === 0
                            ? '카테고리 선택'
                            : search.productCategory.map((item, index) => (
                                <span key={index}> #{item}</span>
                            ))
                        }
                    </button>

                    <div className="search-container">
                        <svg className="search-icon-two" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="7" stroke="#555" strokeWidth="2" />
                            <line x1="15" y1="15" x2="22" y2="22" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            className="search-info-style"
                            type="text"
                            value={search.searchWord}
                            placeholder="검색어 입력"
                            onChange={changeSearchWord}
                        />
                    </div>
                </div>
            </div>
            <div className="product-grid" style={{textAlign:'left'}}>
                {products.map((auction, index) => (
                    <div
                        key={`${auction.product.id}-${index}`}
                        className="product-card"
                        ref={index === products.length - 1 ? ref : null}
                        style={{position:'relative'}}
                    >
                            {isEndingSoon(auction.room.endTime) && (
                                <div className="ending-soon">마감 임박</div>
                            )}
                        <img style={{ cursor: 'pointer' }} onClick={() => moveInfo(auction.room.roomId)}
                            src={`${serverIP.ip}/uploads/auction/product/${auction.product.id}/${auction.product.images[0]?.filename}`}
                            alt={auction.product.productName}
                            className="w-full h-40 object-cover"
                        />
                        <div style={{ cursor: 'pointer' }} onClick={() => moveInfo(auction.room.roomId)} className="product-info">
                            <span style={{ fontSize: "16px", color: "#333" }}>{auction.product.productName}</span> <br />
                            <span style={{color:'black'}}><span>현재 입찰가:</span><span style={{ fontWeight: "700", fontSize:'17px' }}> {auction.room.currentPrice}</span>원</span><br/>
                             <span style={{ fontSize:'13px', color:'#777' }}>즉시 구매가:</span><span style={{ fontWeight: "700", fontSize:'15px', color:'#444' }}> {auction.room.buyNowPrice}</span>원<br/>
                             <span style={{fontSize:'12px',color: '#444'}}>👤입찰자: <span style={{fontSize:'16px', fontWeight:'700'}}>{auction.room.hit}</span></span>&nbsp;&nbsp; <span style={{ color: '#444' }}>⏰{formatDateTime(auction.room.endTime)}</span> {/* 할인된가격 */}

                            <br />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: "5px"
                            }}>
                                <div style={{
                                    padding: "4px 8px",
                                    borderRadius: "5px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    backgroundColor: auction.room.state === "OPEN" ? "green" : "#f2f2f2",
                                    color: auction.room.state === "OPEN" ? "white" : "black",
                                    marginLeft:'30px',whiteSpace:'nowrap'
                                }}>
                                    {auction.room.state === "OPEN" ? "경매 진행중" : "경매 마감"}
                                </div>
                                <div style={{
                                    padding: "4px 8px",
                                    borderRadius: "5px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    backgroundColor: auction.product.shippingFee === 0 ? "#ff4d4d" : "#f2f2f2",
                                    color: auction.product.shippingFee === 0 ? "white" : "black",
                                    marginRight:'30px'
                                }}>
                                    {auction.product.shippingFee === 0 ? "🚚 무료배송" : `배송비 ${auction.product.shippingFee}원`}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/*
function AuctionSearch() {
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
*/
export default AuctionSearch;