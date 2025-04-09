import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../../store/modalSlice";

import axios from "axios";

function SignupForm() {
    const loc = useLocation();
    const serverIP = useSelector((state) => {return state.serverIP});
    const modal = useSelector((state)=>{return state.modal});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleComplete = () => {
        dispatch(setModal({isOpen: !modal.isOpen, selected: "DaumPost"}));
    }

    const [alert, setAlert] = useState({
        userid: {content: "", state: false},
        username: {content: "", state: false},
        userpw: {content: "", state: false},
        userpwCheck: {content: "", state: false},
        tel: {content: "", state: false},
        address: {content: "", state: false}
    });
    const [user, setUser] = useState({
        userid: "",
        username: loc.state.nickname,
        email: loc.state.email,
        userpw: "",
        tel1: "",
        tel2: "",
        tel3: "",
        tel: "",
        address: "",
        addressDetail: "",
        kakaoProfileUrl: loc.state.picture,
        uploadedProfile: null,
        uploadedProfilePreview: null
    });

    useEffect(() => {
        if (modal.info && modal.info.address) {
            addressCheck({ target: { name: "address", value: modal.info.address } });
        }
    }, [modal.info?.address]);

    const validationRules = {
        userid: {
            regex: /^[a-z0-9]{6,12}$/,
            message: "아이디는 6자 이상 12자 이하의 영어 소문자, 숫자만 가능합니다."
        },
        username: {
            regex: /^[A-Za-z가-힣]{2,7}$/,
            message: "이름은 2자 이상 7자 이하의 한글 또는 영어 대소문자만 가능합니다."
        },
        userpw: {
            regex: /^[A-Za-z0-9`~!@#$%^&*?]{8,14}$/,
            message: "비밀번호는 8자 이상 14자 이하의 영어, 숫자, 특수문자만 가능합니다."
        },
        userpwCheck: {
            message: "비밀번호가 일치하지 않습니다."
        },
        tel: {
            regex: /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/,
            message: "전화번호를 올바르게 입력해주세요."
        },
        address: {
            message: "주소를 입력해주세요."
        }
    }

    const changeUser = (e) => {
        // console.log(loc.state)
        // console.log(user);
        const { name, value } = e.target;
        setUser({...user, [name]: value});
        const updatedUser = { ...user, [name]: value };
        
        if (name === "userid") {
            setIdCheck(false);
        }
        if (["tel1", "tel2", "tel3"].includes(name)) {
            updatedUser.tel = `${updatedUser.tel1}-${updatedUser.tel2}-${updatedUser.tel3}`;
            
            const isTelValid = validationRules.tel.regex.test(updatedUser.tel);
            setAlert({
                ...alert,
                tel: {
                    content: isTelValid ? "" : validationRules.tel.message,
                    state: isTelValid
                }
            });

            setUser(updatedUser);
        } else if (name === "userpwCheck") {
            const isMatch = document.getElementById("pw1").value === document.getElementById("pw2").value;
            
            setAlert({
                ...alert,
                [name]: {
                    content: isMatch ? "" : validationRules[name].message,
                    state: isMatch
                }
            });
        } else if (validationRules[name]) {
            const isValid = validationRules[name].regex.test(value);

            setAlert({
                ...alert,
                [name]: {
                    content: isValid ? "" : validationRules[name].message,
                    state: isValid
                }
            });       
        }
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

    const addressCheck = ()=>{
        let isAddrValid = false;
        if (modal.info && modal.info.address) {
            isAddrValid = true;
        }
        setAlert({
            ...alert,
            address: {
                content: isAddrValid ? "" : validationRules.address.message,
                state: isAddrValid
            }
        });
    }

    const validateForm = () => {
        let isValid = true;
    
        for (const key of Object.keys(validationRules)) {
            if (key === "userpwCheck") {
                const isMatch = user.userpw === user.userpwCheck;
                if (!isMatch) {
                    setAlert(prev => ({ 
                        ...prev, 
                        [key]: { content: validationRules[key].message, state: false } 
                    }));
                    return false;  // 첫 번째 오류에서 종료
                }
            } else if (key === "address") {
                const hasAddress = modal.info && modal.info.address;
                if (!hasAddress) {
                    setAlert(prev => ({ 
                        ...prev, 
                        [key]: { content: validationRules[key].message, state: false } 
                    }));
                    return false;
                }
            } else {
                const value = user[key] || "";
                const isValidField = validationRules[key].regex.test(value);
                if (!isValidField) {
                    setAlert(prev => ({ 
                        ...prev, 
                        [key]: { content: validationRules[key].message, state: false } 
                    }));
                    return false;
                }
            }
        }
    
        return isValid;
    };

    const doSignUp = () => {
        // for (const key of Object.keys(alert)) {
        //     console.log(alert);
        //     if (!alert[key].state) {  // 유효하지 않은 항목 찾기
        //         console.log(key);
        //         setAlert(({...alert, [key]: { content: validationRules[key].message}}));
        //         break;
        //     }
        // }

        if (!validateForm()) {
            return;
        }
        
        if (!idCheck) {
            window.alert("아이디 중복 확인을 해주세요.");
            return;
        }
        
        const formData = new FormData();
        formData.append("userid", user.userid);
        formData.append("username", user.username);
        formData.append("email", user.email);
        formData.append("userpw", user.userpw);
        formData.append("tel", user.tel);
        if (modal.info && modal.info.address) formData.append("address", modal.info.address);
        formData.append("addressDetail", user.addressDetail);
        if (modal.info && modal.info.zonecode) formData.append("zipcode", modal.info.zonecode);
    
        if (user.uploadedProfile) {
            formData.append("profileImage", user.uploadedProfile);
        } else {
            formData.append("kakaoProfileUrl", user.kakaoProfileUrl);
        }
    
        if (Object.values(alert).every(item => item.state)) {
            axios.post(`${serverIP.ip}/signup/doSignUp`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            .then(res => {
                window.alert(res.data);
                navigate('/');
            })
            .catch(err => console.log(err));
        } else {
            console.log("실패");
        }
    };

    const modalBackStyle = {    //모달 배경
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: modal.isOpen ? 'block' : 'none',
        transition: 'opacity 0.3s ease'
    }

    const [idCheck, setIdCheck] = useState(false);

    const duplicateCheck = ()=>{
        if (alert.userid.state) {
            axios.get(`${serverIP.ip}/signup/duplicateCheck?userid=${user.userid}`)
            .then(res=>{
                if (res.data === 0) {
                    window.alert("사용 가능한 아이디입니다.");
                }
                else {
                    window.alert("이미 사용 중인 아이디입니다.");
                }
            })
            .catch(err=>console.log(err));
            
            setIdCheck(true);
        }
    }

    return (
        <>
        <div id="modal-background" style={modalBackStyle}></div>
            <div className="sign-up-form">
                <h2>회원가입</h2>
                <label>아이디</label>
                <input type="text" name="userid" onChange={changeUser}/>
                <button id="duplicate-check-btn" onClick={duplicateCheck}>중복확인</button><br/>
                {alert.userid.content && <><span className="form-alert">{alert.userid.content}</span><br/></>}

                <label>이름</label>
                <input type="text" name="username" value={user.username} onChange={changeUser}/><br/>
                {alert.username.content && <><span className="form-alert">{alert.username.content}</span><br/></>}

                <label>이메일</label>
                <input type="text" name="email" disabled value={user.email} onChange={changeUser}/><br/>

                <label>비밀번호</label>
                <input type='password' id="pw1" name="userpw" onChange={changeUser}/><br/>
                {alert.userpw.content && <><span className="form-alert">{alert.userpw.content}</span><br/></>}
                
                <label>비밀번호 확인</label>
                <input type='password' id="pw2" name="userpwCheck" onChange={changeUser}/><br/>
                {alert.userpwCheck.content && <><span className="form-alert">{alert.userpwCheck.content}</span><br/></>}

                <label>휴대폰 번호</label>
                <input type="text" name="tel1" className="tel" maxLength="3" value={user.tel1} onChange={changeUser}/>-
                <input type="text" name="tel2" className="tel" maxLength="4" value={user.tel2} onChange={changeUser}/>-
                <input type="text" name="tel3" className="tel" maxLength="4" value={user.tel3} onChange={changeUser}/><br/>
                {alert.tel.content && <><span className="form-alert">{alert.tel.content}</span><br/></>}

                <label>우편번호</label>
                <input type="text" style={{width: '110px'}} name="zipcode" value={modal.info && modal.info.zonecode} disabled/>
                <button id="postcode" onClick={handleComplete}>주소찾기</button><br/>

                <label>주소</label>
                <input type="text" name="address" readOnly value={modal.info && modal.info.address}/><br/>
                {alert.address.content && <><span className="form-alert">{alert.address.content}</span><br/></>}
                
                <label>상세주소</label>
                <input type='text' name="addressDetail" value={user.addressDetail} onChange={changeUser}/><br/>

                <label>프로필 사진</label>
                <img
                    id="profile-img" 
                    src={user.uploadedProfilePreview || user.kakaoProfileUrl} 
                    alt="프로필 이미지" 
                    referrerPolicy="no-referrer"
                />
                <input type="file" id="profile-image-file" style={{display: "none"}} accept="image/*" onChange={handleImageChange} /><br/>
                <label htmlFor="profile-image-file" id="profile-image-btn">사진첨부</label>
            </div>

            <button id="signup-btn" onClick={()=>doSignUp()}>회원가입</button>
        </>
    );
}

export default SignupForm;