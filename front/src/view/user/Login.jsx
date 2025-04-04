import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SiKakaotalk } from "react-icons/si";
import Logo from "../../img/mimyo_logo-removebg.png";

function Login({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const serverIP = useSelector((state) => state.serverIP.ip);

  const [userid, setUserid] = useState("");
  const [userpw, setUserpw] = useState("");
  const [useridValid, setUseridValid] = useState(null);
  const [userpwValid, setUserpwValid] = useState(null);
  const [isLogin, setIsLogin] = useState(null);

  const [showFindId, setShowFindId] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [userId, setUserId] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async () => {
    if (!userid || !userpw) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(
        `${serverIP}/auth/login`,
        { userid, userpw },
        { withCredentials: true }
      );
      if (response.status === 200) {
        dispatch(setUser(response.data));
        navigate("/");
        onClose();
      }
    } catch (err) {
      setIsLogin(false);
      const errorMsg = err.response?.data;
      if (typeof errorMsg === "string") {
        if (errorMsg.startsWith("유저")) {
          setUseridValid(false);
          setUserpwValid(null);
        } else if (errorMsg.startsWith("비밀")) {
          setUseridValid(true);
          setUserpwValid(false);
        } 
        else if(err.response.data.substring(0,2) === '정지') {
                alert('정지된 사용자입니다.');
        }
        else {
          alert(errorMsg);
        }
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
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
        `${serverIP}/auth/reset-password/verify`, // 올바른 엔드포인트
        null,
        {
          params: { email, code: verificationCode },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setStep(2); // 인증 성공 시 다음 단계로
    } catch (err) {
      console.log("❌ Error details:", err.response?.data); // 콘솔엔 전체 출력

      // 에러 메시지를 문자열로 뽑아서 alert에 보여줌
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
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
            <p>회원님의 아이디는 다음과 같습니다:</p>
            <strong>{userId}</strong>
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
      <span className="close-btn" onClick={onClose}>
        x
      </span>
      <img src={Logo} alt="로고" className="login-logo" />

      {showFindId || showResetPw ? (
        renderAuthFlow()
      ) : (
        <div>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="아이디"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {useridValid === false && (
              <span className="validation-error">
                아이디가 존재하지 않습니다
              </span>
            )}
          </div>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="비밀번호"
              value={userpw}
              onChange={(e) => setUserpw(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {userpwValid === false && (
              <span className="validation-error">
                비밀번호가 일치하지 않습니다
              </span>
            )}
          </div>
          <button onClick={handleLogin}>로그인</button>
          <div className="login-links">
            <span onClick={() => setShowFindId(true)}>아이디 찾기</span>
            <span onClick={() => setShowResetPw(true)}>비밀번호 찾기</span>
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
      )}

      <div className="social-login">
        <button
          className="kakao-login"
          onClick={() =>
            (window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URL}&response_type=code&prompt=login`)
          }
        >
          <SiKakaotalk size={20} /> 카카오 회원가입
        </button>
        <button
          className="google-login"
          onClick={() => {
            const params = new URLSearchParams({
              client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URL,
              response_type: "code",
              scope: "openid email profile",
              prompt: "select_account",
            });
            window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
          }}
        >
          <FcGoogle size={20} /> 구글 회원가입
        </button>
      </div>
    </div>
  );
}

export default Login;
