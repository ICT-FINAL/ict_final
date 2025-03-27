import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userid, setUserid] = useState("");
    const [userpw, setUserpw] = useState("");
    const serverIP = useSelector((state) => state.serverIP.ip);

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${serverIP}/auth/login`, {
                userid,
                userpw
            }, { withCredentials: true });

            if (response.status === 200) {
                dispatch(setUser(response.data));
                navigate("/");
            }
        } catch (error) {
            alert("로그인 실패: " + (error.response?.data || "서버 오류"));
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <input 
                type="text" 
                placeholder="아이디" 
                value={userid} 
                onChange={(e) => setUserid(e.target.value)} 
            />
            <br />
            <input 
                type="password" 
                placeholder="비밀번호" 
                value={userpw} 
                onChange={(e) => setUserpw(e.target.value)} 
            />
            <br />
            <button onClick={handleLogin}>로그인</button>
        </div>
    );
}

export default Login;