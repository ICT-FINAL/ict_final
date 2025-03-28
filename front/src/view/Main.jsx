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
        <div>  
            {user ? (
                <>
                    <img src = {user.user.imgUrl.indexOf('http') !==-1 ? `${user.user.imgUrl}`:`${serverIP.ip}${user.user.imgUrl}`} alt='' width={100}/>
                    <h2>환영합니다, {user.user.username}님!</h2>
                    <button onClick={handleLogout}>로그아웃</button>
                </>
            ) : (<>
                <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link></>
            )}
            <button onClick={testfunc}>JWT 토큰 백엔드 테스트</button>
        </div>
    );
}

export default Main;