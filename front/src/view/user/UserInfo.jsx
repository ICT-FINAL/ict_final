import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function UserInfo(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const navigate = useNavigate();
    
    const [userNo, setUserNo] = useState(0);
    const [loginNo, setLoginNo] = useState(0);
    const [userinfo, setUserinfo] = useState({});
    const [profileMenu, setProfileMenu] = useState('guestbook');
    const [guestbookList, setGuestbookList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [replyList, setReplyList] = useState({});
    const [wishCount, setWishCount] = useState(0);
    const [followState, setFollowState] = useState(false);
    const [followerList, setFollowerList] = useState({});
    const [followingList, setFollowingList] = useState({});

    useEffect(()=>{
        if (user) {
            setUserNo(loc.state === null ? user.user.id : loc.state);
            setLoginNo(user.user.id);
        }
    },[]);

    useEffect(()=>{
        if (loginNo !== 0) {
            getGuestbookList();
            getProductList();
            getUserInfo();
            getInfo();
            getFollowState();
        }
    },[loginNo])

    useEffect(() => {
        guestbookList.forEach(item => {
            if (!replyList[item.id]) {
                getReplyList(item.id);
            }
        });
    }, [guestbookList]);

    const getInfo = ()=>{
        axios.get(`${serverIP.ip}/mypage/myInfo?id=${userNo}`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            console.log("info:", res.data);
            setFollowerList(res.data.followerList);
            setFollowingList(res.data.followingList);
            setWishCount(res.data.wishCount);
        })
        .catch(err=>console.log(err));
    }

    const getUserInfo = ()=>{
        axios.get(`${serverIP.ip}/interact/getUserInfo?id=${userNo}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
              }
        })
        .then(res=>{
            console.log("User: ",res.data);
            setUserinfo(res.data);
        })
        .catch(err=>console.log(err));
    }

    const getGuestbookList = ()=>{
        axios.get(`${serverIP.ip}/mypage/guestbookList?id=${userNo}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            setGuestbookList(res.data);
        })
        .catch(err=>console.log(err));
    }

    const guestbookWrite = (id)=>{
        const textareaId = id !== undefined ? `guestbook-write-${id}` : 'guestbook-write';
        const content = document.getElementById(textareaId)?.value || '';

        const data = {
            writer: user.user,
            receiver: userinfo,
            content: content,
            originalId: id
        }
        
        if (!data.content.trim()) {
            alert("내용을 입력해주세요.");
        } else {
            axios.post(`${serverIP.ip}/mypage/guestbookWrite`, JSON.stringify(data), {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(res=>{
                if (id) {
                    replyToggle(id);
                    getReplyList(id);
                } else {
                    getGuestbookList();
                }
            })
            .catch(err=>console.log(err));
        }
        document.getElementById(textareaId).value = '';
    }
    
    const guestbookDelete = (id, parentId = null)=>{
        if (window.confirm("삭제하시겠습니까?")) {
            axios.get(`${serverIP.ip}/mypage/guestbookDelete/${id}`, {
                headers: {
                  Authorization: `Bearer ${user.token}`
                }
            })
            .then(res=>{
                if (parentId) {
                    getReplyList(parentId);
                } else {
                    getGuestbookList();
                }
            })
            .catch(err=>console.log(err));
        }
    }

    const getProductList = ()=>{
        axios.get(`${serverIP.ip}/mypage/productList/${userNo}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            console.log("판매작품:", res.data);
            setProductList(res.data);
        })
        .catch(err=>console.log(err));
    }

    const getReplyList = (id)=>{
        axios.get(`${serverIP.ip}/mypage/replyList/${id}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            setReplyList(prev => ({
                ...prev,
                [id]: res.data
            }));
        })
        .catch(err=>console.log(err));
    }

    const replyToggle = (id) => {
        let guestbookState = document.getElementById(`guestbook-${id}`);
        guestbookState.style.display === "flex" ? 
        guestbookState.style.display = "none" : 
        guestbookState.style.display = "flex";
    };

    const moveInfo = (prod) => {
        console.log(prod);
        navigate('/product/info',{state:{product:prod}});
    }
    
    const getFollowState = ()=>{
        if (userNo !== loginNo) {
            axios.get(`${serverIP.ip}/interact/getFollowState?from=${loginNo}&to=${userNo}`, {
                headers: {
                  Authorization: `Bearer ${user.token}`
                }
            })
            .then(res=>{
                setFollowState(res.data);
            })
            .catch(err=>console.log(err));
        }
    }
    const followUser = ()=>{
        if (followState && !window.confirm("언팔로우 하시겠습니까?")) return;
        axios.get(`${serverIP.ip}/interact/followUser?from=${loginNo}&to=${userNo}&state=${followState}`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
        })
        .then(()=>{
            getFollowState();
        })
        .catch(err=>console.log(err));
    }

    return (
        <div className="profile-container" style={loc.state !== null ? { paddingTop: '140px' } : {}}>
            <div className="profile-top">
                {userinfo.imgUrl && <img src = {userinfo.imgUrl.indexOf('http') !==-1 ? `${userinfo.imgUrl}`:`${serverIP.ip}${userinfo.imgUrl}`} alt='' width={140} height={140}/>}
                <div className="profile-info">
                    <div style={{fontWeight: 'bold', fontSize: '1.2em'}}>
                        <span>{userinfo.username}</span>
                        {
                            userNo !== loginNo &&
                            <button id="follow-btn" style={followState ? {background: '#d1e2d7'} : {}} onClick={followUser}>
                                {followState ? 'Following' : 'Follow'}
                            </button>
                        }
                    </div>
                    <div>별점(후기개수)</div>
                    <div className="profile-follow">
                        <div onClick={userNo === loginNo ? ()=>navigate('/mypage/follow', { state: { followerList, followingList, selected: 'follower' } }) : undefined}>팔로워<br/><span>{followerList.length}</span></div>
                        <div onClick={userNo === loginNo ? ()=>navigate('/mypage/follow', { state: { followerList, followingList, selected: 'following' } }) : undefined}>팔로잉<br/><span>{followingList.length}</span></div>
                        <div>작품찜<br/><span>{wishCount}</span></div>
                    </div>
                </div>
            </div>
            <div className="profile-menu">
                <div onClick={()=>setProfileMenu("guestbook")} className={profileMenu === "guestbook" ? "selected-menu" : {}}>방명록</div>
                <div onClick={()=>setProfileMenu("product")} className={profileMenu === "product" ? "selected-menu" : {}}>판매작품</div>
                <div onClick={()=>setProfileMenu("review")} className={profileMenu === "review" ? "selected-menu" : {}}>구매후기</div>
            </div>
            <div className="profile-bottom">
            {
                profileMenu === "guestbook" &&
                <>
                    {
                        guestbookList.length === 0 &&
                        <div style={{padding: '20px', textAlign: 'center'}}>작성된 방명록이 없습니다.</div>
                    }
                    {
                        loc.state !== null &&
                        <div className="guestbook-write-box">
                            <textarea id="guestbook-write" className="guestbook-write" placeholder="방명록을 남겨 주세요."
                                rows={5} style={{height: '50px', lineHeight: '1.2'}}/>
                            <input type="button" id="guestbook-write-btn" onClick={()=>guestbookWrite()} value="등록"/>
                        </div>
                    }
                    {
                        guestbookList.map(item=>{
                            return (
                                <div key={item.id} className="guestbook-item">
                                    <img id="writer-profile-image" src = {item.writer.uploadedProfileUrl.indexOf('http') !==-1 ? `${item.writer.uploadedProfileUrl}`:`${serverIP.ip}${item.writer.uploadedProfileUrl}`} alt=''/>
                                    <div id={`mgx-${item.writer.id}`}
                                        className='message-who'
                                        style={{
                                            position: 'relative',
                                            top: '-25px',
                                            left: '10px',
                                            display: 'inline-block',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}>
                                        {item.writer.username}
                                        <span style={{fontSize: '14px'}}> &gt;</span>
                                    </div>
                                    <div style={{position: 'absolute', display: 'inline', top: '55px', left: '80px', fontSize: '11pt'}}>{item.writedate.slice(0,16)}</div>
                                    <div id="guestbook-content" style={ loginNo === item.writer.id ? {background: '#9dc0a9'} : {}}><span>{item.content}</span>
                                        {
                                            loginNo === item.writer.id &&
                                            <div className="guestbook-delete-btn" onClick={()=>guestbookDelete(item.id)}>×</div>
                                        }
                                        {
                                            userNo === loginNo && replyList[item.id]?.length === 0 &&
                                            <>
                                                <button id="guestbook-reply-btn" onClick={()=>replyToggle(item.id)}>답글</button>
                                                <div className="guestbook-write-box" id={`guestbook-${item.id}`} style={{display: 'none', border: 'none', padding: '0'}}>
                                                    <span>┗</span>
                                                    <textarea id={`guestbook-write-${item.id}`} className="guestbook-write" placeholder="답글을 입력해 주세요."/>
                                                    <input type="button" id="guestbook-write-btn" onClick={()=>guestbookWrite(item.id)} value="등록"/>
                                                </div>
                                            </>
                                        }
                                    </div>
                                    {
                                        replyList[item.id]?.map(reply => {
                                            return (
                                                <div key={reply.id} className="guestbook-reply" style={loginNo === reply.writer.id ? {background: '#ddd'} : {}}>
                                                    <span>┗ </span>
                                                    <span style={loginNo === reply.writer.id ? {fontWeight: 'bold'} : {}}>{reply.writer.username}</span>: 
                                                    <span style={{lineHeight: '1.4'}}>{reply.content}</span>
                                                    <span style={{
                                                            position: 'absolute',
                                                            bottom: '3px',
                                                            right: '10px',
                                                            fontSize: '10.2pt',
                                                            color: '#666'
                                                        }}>{reply.writedate.slice(0,16)}</span>
                                                    {
                                                        loginNo === reply.writer.id &&
                                                        <div className="reply-delete-btn" onClick={()=>guestbookDelete(reply.id, item.id)}>×</div>
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                    
                </>
            }
            {
                profileMenu === "product" &&
                <div className="product-container">
                    {
                        productList.length === 0 &&
                        <div style={{padding: '20px', textAlign: 'center'}}>등록된 작품이 없습니다.</div>
                    }
                    {
                        productList.map(product=>{
                            return (
                                <div key={product.id} className="product-item" onClick={() => {moveInfo(product)}}>
                                    <img id="product-img" src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0].filename}`} alt='상품이미지준비중'/>
                                    {
                                        product.discountRate !== 0 &&
                                        <div id="discount-sticker">{product.discountRate}</div>
                                    }
                                    <div>상품명: {product.productName}</div>
                                    <div>가격: {product.price}</div>
                                </div>
                            )
                        })
                    }
                </div>
            }
            {
                profileMenu === "review" &&
                <>
                    review
                </>
            }
            </div>
        </div>
    )
}

export default UserInfo;