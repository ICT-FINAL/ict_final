import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { setLoginView } from "../../store/loginSlice";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
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

    const [showFindId, setShowFindId] = useState(false);
    const [showResetPw, setShowResetPw] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [userId, setUserId] = useState("");
    const [newPassword, setNewPassword] = useState("");


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
            else if(err.response.data.substring(0,2) === '정지') {
                alert('정지된 사용자입니다.');
            }
            else alert((err.response.data || "서버 오류"));
        }
    };


    const sendVerificationCode = async () => {
      try {
        if (showResetPw) {
          // 비밀번호 재설정일 경우
          const formData = new URLSearchParams();
          formData.append("userid", userid);
          formData.append("email", email);
  
          await axios.post(`${serverIP}/auth/reset-password/request`, formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true,
          });
        } else {
          // 아이디 찾기일 경우
          await axios.post(`${serverIP}/auth/send-code`, { userid, email });
        }
  
        setIsVerifying(true);
        alert("인증번호가 이메일로 전송되었습니다.");
      } catch (err) {
        alert("이메일 전송 실패: " + err.response?.data?.message);
      }
    };

    const verifyForFindId = async () => {
      try {
        const res = await axios.post(`${serverIP}/auth/find-id/verify`, null, {
          params: { email, code: verificationCode },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        setUserId(res.data.userid);
        setStep(2);
      } catch (err) {
        console.log("Error details:", err.response?.data);
        alert("인증 실패: " + (err.response?.data?.message || "알 수 없는 오류"));
      }
    };
  
    const verifyForResetPw = async () => {
      try {
        const res = await axios.post(
          `${serverIP}/auth/reset-password/verify`,
          null,
          {
            params: { email, code: verificationCode },
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setStep(2);
      } catch (err) {
        console.log("❌ Error details:", err.response?.data);
  
        const errorMsg =
          err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "알 수 없는 오류";
        alert("인증 실패: " + errorMsg);
      }
    };

    const resetPassword = async () => {
      try {
        await axios.post(`${serverIP}/auth/reset-password`, null, {
          params: { email, newPassword },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        resetForm();
      } catch (err) {
        alert(
          "비밀번호 변경 실패: " +
            (err.response?.data?.message || "알 수 없는 오류")
        );
      }
    };
  
    const resetForm = () => {
      setShowFindId(false);
      setShowResetPw(false);
      setStep(1);
      setEmail("");
      setVerificationCode("");
      setIsVerifying(false);
      setUserId("");
      setNewPassword("");
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

    const renderAuthFlow = () => {
      return (
        <div>
          <h3>{showFindId ? "아이디 찾기" : "비밀번호 재설정"}</h3>
          {step === 1 ? (
            <>
              {showResetPw && (
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="아이디 입력"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                  />
                </div>
              )}
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="이메일 입력"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button onClick={sendVerificationCode}>인증번호 요청</button>
              {isVerifying && (
                <>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="인증번호 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={showFindId ? verifyForFindId : verifyForResetPw}
                  >
                    인증 확인
                  </button>
                </>
              )}
            </>
          ) : showFindId ? (
            <div>
              <p style={{color:'white'}}>회원님의 아이디는 다음과 같습니다:</p>
              <strong style={{color:'white'}}>{userId}</strong>
            </div>
          ) : (
            <>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="새 비밀번호 입력"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button onClick={resetPassword}>비밀번호 변경</button>
            </>
          )}
          <button onClick={resetForm} className="back-btn">
            돌아가기
          </button>
        </div>
      );
    };


    return (
        <div className="login-container">
            <span className="close-btn" onClick={onClose}>x</span>

            <img src={Logo} alt="로고" className="login-logo" />

            {showFindId || showResetPw ? (
              renderAuthFlow()
            ) : (
              <>
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
                <span onClick={() => setShowFindId(true)}>아이디 찾기</span>
                <span onClick={() => setShowResetPw(true)}>비밀번호 찾기</span>
            </div>
            </>
            )}

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