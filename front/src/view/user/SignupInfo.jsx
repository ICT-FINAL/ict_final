import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import axios from "axios";

function SignupInfo() {
    const loc = useLocation();
    const serverIP = useSelector((state) => {return state.serverIP});
    const navigate = useNavigate();
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

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

    const termsCheck = ()=>{
        const isChecked = document.querySelector('input[name="agree"]:checked');
        if (!isChecked) {
            setIsTermsChecked(false);
            setShowAlert(true);
        } else {
            setIsTermsChecked(true);
            setShowAlert(false);
        }
    }

    const formCheck = ()=>{
        // if (/^[a-z]{6,12}$/.test(user.userid))
    }

    return (
        <div className="sign-up-container">
            <h3>회원가입</h3>
            <div className="terms">
                <pre style={{overflowY: 'scroll', height: '500px', border: '1px solid #ddd', padding: '10px'}}>
                {`1. 목적
이 약관은 회원이 본 사이트를 통해 수제품을 제작, 판매, 구매하는 과정에서의 권리, 의무 및 책임을 규정합니다.

2. 용어 정의
회원: 본 약관에 동의하고 사이트에 가입한 자

판매자: 사이트를 통해 수제품을 등록하고 판매하는 회원

구매자: 사이트에서 수제품을 구매하는 회원

거래 보호 서비스: 안전한 거래를 위해 회사가 제공하는 결제 및 중개 시스템

3. 회원 가입 및 관리
회원은 본 약관에 동의해야 가입할 수 있습니다.

판매자는 추가 등록 절차를 거쳐야 하며, 회사는 판매 등록을 승인 또는 거부할 수 있습니다.

회원 정보는 정확해야 하며, 허위 정보 입력 시 서비스 이용이 제한될 수 있습니다.

4. 서비스 이용 및 거래 조건
4.1 판매자 관련 규정
판매자는 직접 제작한 수제품만 등록할 수 있으며, 타인의 저작권을 침해하는 상품은 금지됩니다.

판매자는 정확한 상품 정보(재료, 제작 기간, 가격 등)를 제공해야 합니다.

주문 후 제작 방식의 경우 예상 배송 기간을 명확히 고지해야 합니다.

회사는 품질 유지 및 신뢰도 관리를 위해 판매자의 활동을 모니터링할 수 있습니다.

4.2 구매자 관련 규정
구매자는 상품 설명을 충분히 확인하고 신중하게 구매해야 합니다.

구매 후 단순 변심으로 인한 취소 및 환불이 제한될 수 있습니다.

4.3 결제 및 정산
모든 거래는 회사가 제공하는 안전 결제 시스템을 이용해야 합니다.

결제 완료 후 구매자는 상품을 수령하고, 일정 기간 내 확인 후 정산이 이루어집니다.

판매자의 정산 금액은 회사의 정산 정책에 따라 지급됩니다.

5. 금지 행위
회원은 다음 행위를 해서는 안 됩니다.

타인의 지적 재산권을 침해하는 상품 등록

불법 또는 유해한 제품 판매

사이트 외부에서의 직거래 유도

허위 리뷰 작성 및 조작

위반 시 계정 정지, 서비스 이용 제한 등의 조치가 취해질 수 있습니다.

6. 분쟁 해결 및 책임 제한
판매자와 구매자 간 분쟁 발생 시 회사는 중재할 수 있으나, 개별 거래에 대한 법적 책임은 부담하지 않습니다.

불가항력적 사유(시스템 오류, 천재지변 등)로 인한 피해에 대해 회사는 책임을 지지 않습니다.

7. 약관 변경 및 공지
회사는 필요 시 약관을 개정할 수 있으며, 변경된 약관은 공지 후 적용됩니다.

변경된 약관에 동의하지 않는 경우 회원 탈퇴가 가능합니다.

8. 준거법 및 관할 법원
본 약관은 대한민국 법률을 따르며, 분쟁 발생 시 관할 법원에서 해결합니다.`}
                </pre>
                
                <input type="radio" name="agree" value="agree" required onChange={()=>setShowAlert(false)}/>
                (필수) 약관 및 개인정보 처리방침에 동의합니다.
                <button onClick={termsCheck}>다음</button>
                {showAlert && <div id="terms-alert">서비스 이용을 위해 약관 및 개인정보 보호 정책에 동의해 주세요.</div>}
            </div>

            {
                isTermsChecked &&
                <div>
                <div className="sign-up-form">
                    <label>아이디</label>
                    <input type="text" name="userid" onChange={changeUser}/>
                    <input type="button" id="duplicate-check-btn" value="아이디 중복 확인"/><br/>

                    <label>이름</label>
                    <input type="text" name="username" value={user.username} onChange={changeUser}/><br/>

                    <label>이메일</label>
                    <input type="text" name="email" readOnly value={user.email} /><br/>

                    <label>비밀번호</label>
                    <input type='password' name="userpw" onChange={changeUser}/><br/>
                    
                    <label>비밀번호 확인</label>
                    <input type='password' name="userpw" onChange={changeUser}/><br/>

                    <label>프로필 사진 업로드</label>
                    <img
                        id="profile-img" 
                        src={user.uploadedProfilePreview || user.kakaoProfileUrl} 
                        alt="프로필 이미지" 
                        referrerPolicy="no-referrer"
                    />
                    <input type="file" accept="image/*" onChange={handleImageChange} /><br/>
                </div>

                <button id="signup-btn" onClick={()=>doSignUp()}>회원가입</button>
                </div>
            }
            

            
        </div>
    );
}

export default SignupInfo;