import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function MyPageProfile(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    
    const [profileMenu, setProfileMenu] = useState('guestbook');
    const [guestbookList, setGuestbookList] = useState([]);
    const [productList, setProductList] = useState([]);

    useEffect(()=>{
        getGuestbookList();
        getProductList();
    },[]);

    const getGuestbookList = ()=>{
        axios.get(`${serverIP.ip}/mypage/guestbookList`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            console.log(res.data);
            setGuestbookList(res.data);
        })
        .catch(err=>console.log(err));
    }

    const guestbookWrite = ()=>{
        const data = {
            writer: user.user,
            content: document.getElementById("guestbook-write").value
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
                console.log(res.data);
                getGuestbookList();
            })
            .catch(err=>console.log(err));
        }
        document.getElementById("guestbook-write").value = '';
    }
    
    const guestbookDelete = (id)=>{
        if (window.confirm("삭제하시겠습니까?")) {
            axios.get(`${serverIP.ip}/mypage/guestbookDelete/${id}`, {
                headers: {
                  Authorization: `Bearer ${user.token}`
                }
            })
            .then(res=>{
                console.log(res.data);
                getGuestbookList();
            })
            .catch(err=>console.log(err));
        }
        
    }

    const getProductList = ()=>{
        axios.get(`${serverIP.ip}/mypage/productList/${user.user.id}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            console.log(res.data);
            setProductList(res.data);
        })
        .catch(err=>console.log(err));
    }
    
    return (
        <div className="profile-container">
            <div className="profile-top">
                <img src = {user.user.imgUrl.indexOf('http') !==-1 ? `${user.user.imgUrl}`:`${serverIP.ip}${user.user.imgUrl}`} alt='' width={140} height={140}/>
                <div className="profile-info">
                    <div style={{fontWeight: 'bold', fontSize: '1.2em'}}>{user.user.username}
                        <button id="follow-btn">팔로우</button>
                    </div>
                    <div>별점(후기개수)</div>
                    <div className="profile-follow">
                        <div>팔로워<br/><span>100</span></div>
                        <div>팔로잉<br/><span>300</span></div>
                        <div>작품찜<br/><span>50</span></div>
                    </div>
                </div>
            </div>
            <div className="profile-menu">
                <div onClick={()=>setProfileMenu("guestbook")}>방명록</div>
                <div onClick={()=>setProfileMenu("product")}>판매작품</div>
                <div onClick={()=>setProfileMenu("review")}>구매후기</div>
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
                        guestbookList.map(item=>{
                            return (
                                <div className="guestbook-item">
                                    <img id="writer-profile-image" src = {item.writer.uploadedProfileUrl.indexOf('http') !==-1 ? `${item.writer.uploadedProfileUrl}`:`${serverIP.ip}${item.writer.uploadedProfileUrl}`} alt=''/>
                                        <div id="writer-name">{item.writer.username}<span style={{fontSize: '14px'}}> &gt;</span></div>
                                        <div style={{float: 'right', padding: '25px'}}>{item.writedate}</div>
                                        <div id="guestbook-content">{item.content}
                                            {
                                                user.user.id === item.writer.id &&
                                                <div id="guestbook-delete-btn" onClick={()=>guestbookDelete(item.id)}>×</div>
                                            }
                                        </div>
                                </div>
                            )
                        })
                    }
                    <div className="guestbook-write-box">
                        <textarea id="guestbook-write" placeholder="방명록을 남겨 주세요."/>
                        <input type="button" id="guestbook-write-btn" onClick={guestbookWrite} value="등록"/>
                    </div>
                </>
            }
            {
                profileMenu === "product" &&
                <>
                    {
                        productList.map(item=>{
                            return (
                                <div className="product-item">
                                    <img src={`${serverIP.ip}/uploads/product/${item.id}/${item.images[0].filename}`} alt='ff'/>
                                    <div>상품명: {item.productName}</div>
                                    <div>가격: {item.price}</div>
                                </div>
                            )
                        })
                    }
                </>
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

export default MyPageProfile;