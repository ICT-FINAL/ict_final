import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import axios from "axios";

function SignupInfo() {
    const loc = useLocation();
    const serverIP = useSelector((state) => {return state.serverIP});
    const navigate = useNavigate();

    const [user, setUser] = useState({
        userid: "",
        username: loc.state.nickname,
        kakaoProfileUrl: loc.state.picture,
        email: loc.state.email,
        uploadedProfile: null,
        uploadedProfilePreview: null, 
        userpw: ""
    });

    const changeUser = (e) => {
        console.log(loc.state)
        console.log(user);
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setUser((prev) => ({
                ...prev,
                uploadedProfile: null,
                uploadedProfilePreview: null,
                kakaoProfileUrl: loc.state.picture
            }));
            return;
        }
    
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUser((prev) => ({
                    ...prev,
                    uploadedProfile: file, 
                    uploadedProfilePreview: event.target.result, 
                    kakaoProfileUrl: null 
                }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("이미지 파일만 업로드 가능합니다.");
            e.target.value = "";
        }
    };

    const doSignUp = () => {
        const formData = new FormData();
        formData.append("userid", user.userid);
        formData.append("username", user.username);
        formData.append("email", user.email);
        formData.append("userpw", user.userpw);
    
        if (user.uploadedProfile) {
            formData.append("profileImage", user.uploadedProfile);
        } else {
            formData.append("kakaoProfileUrl", user.kakaoProfileUrl);
        }
    
        axios.post(`${serverIP.ip}/signup/doSignUp`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(res => {
            alert(res.data);
            navigate('/login');
        })
        .catch(err => console.log(err));
    };

    return (
        <div>
            <label>아이디</label>
            <input type="text" name="userid" onChange={changeUser}/><br/>

            <label>이름</label>
            <input type="text" name="username" value={user.username} onChange={changeUser}/><br/>

            <label>이메일</label>
            <input type="text" name="email" readOnly value={user.email} /><br/>

            <label>프로필 사진 업로드</label>
            <input type="file" accept="image/*" onChange={handleImageChange} /><br/>
            비밀번호<input type='password' name="userpw" onChange={changeUser}/>
            <img 
                src={user.uploadedProfilePreview || user.kakaoProfileUrl} 
                alt="프로필 이미지" 
                style={{ width: "100px", height: "100px", objectFit: "cover", marginTop: "10px" }} 
            />
            <button onClick={()=>doSignUp()}>ㄱㄱ</button>
        </div>
    );
}

export default SignupInfo;