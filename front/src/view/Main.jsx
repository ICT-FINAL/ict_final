import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function Main() {
    let serverIP = useSelector((state) => state.serverIP);
    let dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    function testfunc() {
        if(user)
            axios.get(`${serverIP.ip}/test`, {
                headers: { Authorization: `Bearer ${user.token}` }, //유저 정보 백에서 쓰고싶으면 이거 넘기기
            })
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
    }

    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
    }
    useEffect(() => {
        console.log("현재 로그인된 사용자:", user);
    }, [user]);

    return (
        <div style={{height:'1000px',paddingTop:'100px'}}>  
            {user ? (
                <>
                    <img src = {user.user.imgUrl.indexOf('http') !==-1 ? `${user.user.imgUrl}`:`${serverIP.ip}${user.user.imgUrl}`} alt='' width={100}/>
                    <h5>환영합니다, {user.user.username}님!</h5>
                </>
            ) : (<>
            <Link to="/test">테스트</Link><br/></>
            )}
            <button onClick={testfunc}>jwt 슛</button>
            <Link to="/test">테스트</Link><br/>
        </div>
    );
}

export default Main;