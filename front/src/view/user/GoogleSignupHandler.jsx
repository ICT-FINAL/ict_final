import React, { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const GoogleSignupHandler = () => {
    const code = new URL(window.location.href).searchParams.get('code'); // Google OAuth 인증 코드 가져오기
    const serverIP = useSelector((state) => state.serverIP); // Redux에서 서버 주소 가져오기
    const navigate = useNavigate();

    useEffect(() => {
        if (code) {
            axios.get(`${serverIP.ip}/signup/google?code=${code}`)
                .then((res) => {
                    if (!res.data) {
                        alert("이미 가입한 회원입니다.");
                        navigate('/');
                    } else {
                        navigate("/signup/info", { state: res.data });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    alert("회원가입에 실패했습니다. 다시 시도해주세요.");
                    navigate("/");
                });
        }
    }, [code, serverIP, navigate]);

    return <div>잠시 대기...</div>;
};

export default GoogleSignupHandler;