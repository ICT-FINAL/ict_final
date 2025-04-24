import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MyFollow(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedTab = searchParams.get('tab') || 'follower';
    const [followerList, setFollowerList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [grade, setGrade] = useState(['✊','☝️','✌️','🖐️']);

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = ()=>{
        axios.get(`${serverIP.ip}/mypage/myFollow?id=${user.user.id}`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            setFollowerList(res.data.followerList);
            setFollowingList(res.data.followingList);
        })
        .catch(err=>console.log(err));
    }

    function handleCancel(){
        alert("아직 취소안됨");
    }

    return (
        <div className='follow-container'>
            <ul className='follow-menu'>
                <li className={selectedTab === 'follower' ? 'selected-menu' : {}} onClick={() => navigate('?tab=follower')}>팔로워</li>
                <li className={selectedTab === 'following' ? 'selected-menu' : {}} onClick={() => navigate('?tab=following')}>팔로잉</li>
            </ul>

            <div className='follow-list' >
            {
                (selectedTab === "follower" ? followerList : followingList).map(user => (
                    <div key={user.id} className="follow-user-item">
                        <img className="follow-user-img" src = {user.profileImageUrl.indexOf('http') !==-1 ? `${user.profileImageUrl}`:`${serverIP.ip}${user.profileImageUrl}`} alt=''/>
                        <div className="follow-user-info">
                            <div id={`mgx-${user.id}`} className='message-who' style={{cursor: 'pointer'}}>{user.username}<span>{grade[user.grade]}</span></div>
                            <div>{user.infoText}</div>
                        </div>
                        <button className="follow-cancel-btn" onClick={() => handleCancel(user.id)}>
                            ❌
                        </button>
                    </div>
                ))
            }
            </div>
        </div>
    )
}

export default MyFollow;