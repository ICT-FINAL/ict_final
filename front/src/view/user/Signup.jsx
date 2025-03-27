import React from "react";

function Signup() {
    const handleSignup = (e) => {
        const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URL}&response_type=code&prompt=login`;
        window.location.href = kakaoLoginUrl;
    };
    const handleLogout = () => {
        const KAKAO_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&logout_redirect_uri=${process.env.REACT_APP_KAKAO_LOGOUT_REDIRECT_URL}`;
        window.location.href = KAKAO_LOGOUT_URL;
    };
    return (
        <div>
            <button onClick={handleSignup}>카카오 회원가입</button>
            <button onClick={handleLogout}>카카오 회원 정보 파기(아직 미구현)</button>
        </div>
    );
}

export default Signup;