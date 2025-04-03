import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

function MyPageProfile(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    
    const [profileMenu, setProfileMenu] = useState('guestbook');
    console.log(user);

    const showGuestbookList = ()=>{
        axios.get('')
        .then(res=>{
            console.log(res.data);
        })
        .catch(err=>console.log(err));
    }

    const guestbookWrite = ()=>{
        console.log(document.getElementById("guestbook-write").value);
        console.log(user.user.id);
        const data = {
            userNo: user.user.id,
            content: document.getElementById("guestbook-write").value
        }

        axios.post(`${serverIP.ip}/mypage/guestbookWrite`, JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res=>{
            console.log(res.data);
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
            {
                profileMenu === "guestbook" &&
                <div className="profile-bottom">
                    <div>방명록 리스트</div>
                    <div className="guestbook-write-box">
                        <input type="text" id="guestbook-write" placeholder="댓글을 남겨 주세요."/>
                        <input type="button" id="guestbook-write-btn" onClick={guestbookWrite} value="등록"/>
                    </div>
                </div>
            }
            {
                profileMenu === "product" &&
                <div className="profile-bottom">
                    product
                </div>
            }
            {
                profileMenu === "review" &&
                <div className="profile-bottom">
                    review
                </div>
            }
        </div>
    )
}

export default MyPageProfile;