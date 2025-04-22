import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../../store/modalSlice";
import { clearUser } from "../../../store/authSlice";

import axios from "axios";
import MyPwdEdit from "./MyPwdEdit";

function MyInfoEdit() {
    // start : 개인정보 수정
    const getUser = useSelector((state) => state.auth.user);
    const [userInfo, setUserInfo] = useState({});
    const [currentPage, setCurrentPage] = useState('infoEditPage');
    // end : 개인정보 수정

    const loc = useLocation();
    const serverIP = useSelector((state) => {return state.serverIP});
    const modal = useSelector((state)=>{return state.modal});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const uuser = useSelector((state) => state.auth.user);

    const handleComplete = (e) => {
        e.preventDefault();
        dispatch(setModal({isOpen: !modal.isOpen, selected: "DaumPost"}));
    }

    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
        window.location.href = '/';
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
    });

    useEffect(() => {
        if (modal.info && modal.info.address) {
            addressCheck({ target: { name: "address", value: modal.info.address } });
        }
    }, [modal.info?.address]);

    const validationRules = {
        username: {
            regex: /^[A-Za-z가-힣]{2,7}$/,
            message: "이름은 2자 이상 7자 이하의 한글 또는 영어 대소문자만 가능합니다."
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
        const { name, value } = e.target;
        setUser({...user, [name]: value}); // 입력하는 데이터값 저장
        setUserInfo({...user, [name]: value}); // 기존 회원정보 데이터값 저장
        const updatedUser = { ...user, [name]: value };
        
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
            telCheck();
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
        if(user.username==userInfo.username && modal.info.address === undefined){
            window.alert("변경사항이 없습니다.");
            return false;
        }

        let isValid = true;

        for (const key of Object.keys(validationRules)) {
            if (key === "address") {
                const hasAddress = user.address !== "";
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

    const doSignUp = (event) => {
        event.preventDefault(); // 폼이 제출될 때 페이지 리로드를 막음

        if (!validateForm()) {
            return;
        }
        
        const formData = new FormData();
        formData.append("username", user.username);
        if (modal.info && modal.info.address) formData.append("address", modal.info.address);
        formData.append("addressDetail", user.addressDetail);
        if (modal.info && modal.info.zonecode) formData.append("zipcode", modal.info.zonecode);
    
        /*
        if (user.uploadedProfile) {
            formData.append("profileImage", user.uploadedProfile);
        } else {
            formData.append("kakaoProfileUrl", user.kakaoProfileUrl);
        }*/

        if(uuser)        
            axios.post(`${serverIP.ip}/mypage/editInfo`,user, {
                headers: {Authorization:`Bearer ${uuser.token}`}
            })
            .then(res => {
                window.alert("정상적으로 수정이 완료되었습니다. \n 다시 로그인해주세요.");
                handleLogout();
            })
            .catch(err=> console.log(err))
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
    
    const [telNumCheck, setTelNumCheck] = useState(false);

    const telCheck = ()=>{
        axios.get(`${serverIP.ip}/signup/telCheck?tel=${user.tel}`)
        .then(res=>{
            if (res.data === 0) {
                setTelNumCheck(true);
            }
            else {
                setTelNumCheck(false);
            }
        })
        .catch(err=>console.log(err));
    }

    /* 개인정보수정 */
    useEffect(() => {
        if (getUser) {
            axios.get(`${serverIP.ip}/mypage/getUser`, {
                headers: { Authorization: `Bearer ${getUser.token}` }
            })
            .then((res) => {
                const tel = res.data.tel || '';
                const [tel1, tel2, tel3] = tel.split('-');
                setUser({ 
                    ...res.data,
                    tel1: tel1 || '',
                    tel2: tel2 || '',
                    tel3: tel3 || ''
                });
                setUserInfo({ 
                    ...res.data,
                    tel1: tel1 || '',
                    tel2: tel2 || '',
                    tel3: tel3 || ''
                });
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }, [getUser, serverIP.ip]);

    return (
        
        <>
        { currentPage === "infoEditPage" &&
            <>
                <div id="modal-background" style={modalBackStyle}></div>
                <form className="sign-up-form" onSubmit={doSignUp}>
                    <label>아이디</label>
                    <input type="text" name="userid" value={userInfo.userid || ''} style={{width:'calc(65%)', backgroundColor:'#ddd'}} disabled/>

                    <label>이름</label>
                    <input type="text" name="username" value={userInfo.username || ''} onChange={changeUser}/><br/>
                    {alert.username.content && <><span className="form-alert">{alert.username.content}</span><br/></>}

                    <label>이메일</label>
                    <input type="text" name="email" value={userInfo.email || ''} style={{width:'calc(65%)', backgroundColor:'#ddd'}} autoComplete="useremail" readOnly/><br/>

                    <label>휴대폰 번호</label>
                    <input type="text" name="tel1" className="tel" maxLength="3" value={userInfo.tel1 || ''} onChange={changeUser}/>-
                    <input type="text" name="tel2" className="tel" maxLength="4" value={userInfo.tel2 || ''} onChange={changeUser}/>-
                    <input type="text" name="tel3" className="tel" maxLength="4" value={userInfo.tel3 || ''} onChange={changeUser}/><br/>
                    {alert.tel.content && <><span className="form-alert">{alert.tel.content}</span><br/></>}

                    <label>우편번호</label>
                    <input type="text" style={{width: '110px'}} name="zipcode" value={modal.info && modal.info.zonecode ? modal.info.zonecode : (userInfo.zipcode || '')} disabled/>
                    <button id="postcode" onClick={handleComplete}>주소찾기</button><br/>

                    <label>주소</label>
                    <input type="text" name="address" readOnly value={modal.info && modal.info.address ? modal.info.address : userInfo.address || ''}/><br/>
                    {alert.address.content && <><span className="form-alert">{alert.address.content}</span><br/></>}
                    
                    <label>상세주소</label>
                    <input type='text' name="addressDetail" value={userInfo.addressDetail || ''} onChange={changeUser}/><br/>

                    <label>프로필 사진 {userInfo.uploadedProfilePreview}</label>
                    <img id="profile-img" src={userInfo.kakaoProfileUrl ? `${userInfo.kakaoProfileUrl}` : `${serverIP.ip}${userInfo.uploadedProfileUrl}`} alt="프로필 이미지" referrerPolicy="no-referrer" />
                
                    <input type="file" id="profile-image-file" style={{display: "none"}} accept="image/*" onChange={handleImageChange} /><br/>
                    <label htmlFor="profile-image-file" id="profile-image-btn">사진첨부</label>

                    <button type="submit" id="signup-btn">수정</button>
                </form>
                <div style={{textAlign:'right', fontSize:'12px'}} onClick={()=>setCurrentPage("pwdPage")} >비밀번호 재설정</div>
            </>
        }

        {currentPage === "pwdPage" && <MyPwdEdit/>}
        </>
        
    );
}

export default MyInfoEdit;