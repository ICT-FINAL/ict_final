import React, { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";  // useNavigate로 페이지 이동 관리

const LoginHandler = () => {
    const code = new URL(window.location.href).searchParams.get('code');  // URL에서 code 추출
    const serverIP = useSelector((state) => state.serverIP);  // Redux에서 서버 IP를 가져옵니다.
    const navigate = useNavigate();  // useNavigate를 사용하여 리다이렉트

    useEffect(() => {
        if (code) {
            // 서버로 code 전달하여 로그인 처리
            axios.get(`${serverIP.ip}/login/kakao?code=${code}`)
                .then((res) => {
                    console.log(res.data);
                    // 로그인 후 다른 페이지로 리다이렉트 (예: 대시보드)
                    navigate("/dashboard");  // 리다이렉트: /dashboard 페이지로 이동
                })
                .catch((err) => {
                    console.log(err);
                    // 에러 처리
                    alert("로그인에 실패했습니다. 다시 시도해주세요.");
                    navigate("/");  // 로그인 실패 시 홈으로 리다이렉트
                });
        }
    }, [code, serverIP, navigate]);

    return (
        <div>
            잠시 대기...
        </div>
    );
}

export default LoginHandler;