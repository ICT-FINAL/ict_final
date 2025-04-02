import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { setLoginView } from "../../store/loginSlice";
import { FaUser, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SiKakaotalk } from "react-icons/si";
import { Check, X } from "lucide-react"; 
import Logo from '../../img/mimyo_logo-removebg.png';

function Login({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userid, setUserid] = useState("");
    const [userpw, setUserpw] = useState("");
    const [useridValid, setUseridValid] = useState(null);
    const [userpwValid, setUserpwValid] = useState(null);
    const [isLogin,setIsLogin] = useState(null);

    const serverIP = useSelector((state) => state.serverIP.ip);

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${serverIP}/auth/login`, {
                userid,
                userpw
            }, { withCredentials: true });

            if (response.status === 200) {
                dispatch(setUser(response.data));
                window.location.href='/';
                onClose();
            }
        } catch (err) {
            setIsLogin(true);
            console.log(err.response.data.substring(0,2));
            if(err.response.data.substring(0,2) === '유저')setUseridValid(false);
            else if(err.response.data.substring(0,2) === '비밀') {
                setUseridValid(true);
                setUserpwValid(false);
            }
            else alert((err.response.data || "서버 오류"));
        }
    };

    const handleSignup = () => {
        const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URL}&response_type=code&prompt=login`;
        window.location.href = kakaoLoginUrl;
    };
    const handleGoogleSignup = () => {
        const params = new URLSearchParams({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URL,
            response_type: "code",
            scope: "openid email profile",
            prompt: "select_account",
        });
    
        console.log("Google Login URL:", `https://accounts.google.com/o/oauth2/auth?${params.toString()}`); // 디버깅용
        window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
    
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <span className="close-btn" onClick={onClose}>x</span>

            <img src={Logo} alt="로고" className="login-logo" />

            <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input 
                    type="text" 
                    placeholder="아이디" 
                    value={userid} 
                    onChange={(e) => {
                        setUserid(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                />
                {isLogin && (
                    useridValid ? <Check className="input-status valid" /> : <X className="input-status invalid" />
                )}
            </div>

            <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                    type="password" 
                    placeholder="비밀번호" 
                    value={userpw} 
                    onChange={(e) => {
                        setUserpw(e.target.value);
                    }}
                    onKeyDown={handleKeyPress} 
                />
                {isLogin && (
                    userpwValid ? <Check className="input-status valid" /> : <X className="input-status invalid" />
                )}
            </div>

            <button onClick={handleLogin}>로그인</button>

            <div className="login-links">
                <span onClick={() => navigate("/")}>아이디 찾기</span>
                <span onClick={() => navigate("/")}>비밀번호 찾기</span>
            </div>

            <div className="social-login">
                <button className="kakao-login" onClick={handleSignup}>
                    <SiKakaotalk size={20} />
                    카카오 회원가입
                </button>
                <button className="google-login" onClick={handleGoogleSignup}>
                    <FcGoogle size={20} />
                    구글 회원가입
                </button>
            </div>
        </div>
    );
}

export default Login;