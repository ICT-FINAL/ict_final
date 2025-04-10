import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const GoogleSignupHandler = () => {
    const [isLoading, setIsLoading] = useState(true); // 초기값 true (로딩 시작)
    const code = new URL(window.location.href).searchParams.get('code');
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();

    useEffect(() => {
        if (code) {
            axios.get(`${serverIP.ip}/signup/google?code=${code}`)
                .then((res) => {
                    setIsLoading(false); // API 응답 후 로딩 종료
                    if (!res.data) {
                        navigate('/already');
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

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            {isLoading && <div className="loader"></div>} {/* 🔄 로딩 화면 표시 */}
        </div>
    );
};

export default GoogleSignupHandler;