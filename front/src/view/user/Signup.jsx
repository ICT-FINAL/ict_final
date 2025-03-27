import React from "react";

function Signup() {
    const handleSignup = (e) => {
        e.preventDefault(); 
        const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URL}&response_type=code`;
        window.location.href = kakaoLoginUrl;
    };

    return (
        <div>
            <button onClick={handleSignup}>카카오 회원가입</button>
        </div>
    );
}

export default Signup;