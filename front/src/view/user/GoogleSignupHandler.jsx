import React, { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const GoogleSignupHandler = () => {
    const code = new URL(window.location.href).searchParams.get('code');
    const serverIP = useSelector((state) => state.serverIP);
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