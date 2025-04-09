import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

function MyFollow(){
    const location = useLocation();
    const followerList = location.state?.followerList || [];
    const followingList = location.state?.followingList || [];
    const [selected, setSelected] = useState('');
    let serverIP = useSelector((state) => state.serverIP);

    useEffect(() => {
        setSelected(location.state?.selected);
    }, []);

    return (
        <div className='follow-container'>
            <ul className='follow-menu'>
                <li onClick={()=>setSelected("follower")}>팔로워</li>
                <li onClick={()=>setSelected("following")}>팔로잉</li>
            </ul>

            {selected === "follower" &&
                <>
                    <h3>팔로워 목록</h3>
                    <div className='follow-list'>
                    {
                        followerList.map(user => (
                            <div key={user.id}>
                                <img className="follow-user-img" src = {user.profileImageUrl.indexOf('http') !==-1 ? `${user.profileImageUrl}`:`${serverIP.ip}${user.profileImageUrl}`} alt=''/>
                                <div id={`mgx-${user.id}`}>{user.username}</div>
                            </div>
                        ))
                    }
                    </div>
                </>
            }

            {selected === "following" &&
                <>
                    <h3>팔로잉 목록</h3>
                    <div className='follow-list'>
                    {
                        followingList.map(user => (
                            <div key={user.id}>
                                <img className="follow-user-img" src = {user.profileImageUrl.indexOf('http') !==-1 ? `${user.profileImageUrl}`:`${serverIP.ip}${user.profileImageUrl}`} alt=''/>
                                <div id={`mgx-${user.id}`}>{user.username}</div>
                            </div>
                        ))
                    }
                    </div>
                </>
            }
        </div>
    )
}

export default MyFollow;