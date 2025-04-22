import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

function MyPwdEdit(){

    const serverIP = useSelector((state) => {return state.serverIP});
    const user = useSelector((state) => state.auth.user);

    //변경된 회원정보를 보관할 변수
    let [modData, setModData] = useState({
        user_pw : '',
        modUserPw : '',
        modUserPwCheck : ''
    })

    // 비밀번호를 찾기위해 데이터가 성공적으로 조회되었는지를 저장할 상태
    let [pwFound, setPwFound] = useState(false);

    async function pwdCheck(event) {
        event.preventDefault();
    
        console.log(user.user.id);
        console.log(modData.user_pw);

        if(user)        
            axios.post(`${serverIP.ip}/mypage/pwdCheck`, JSON.stringify({userId: user.user.id, modUserPw: modData.user_pw}) , {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:`Bearer ${user.token}`
                }
            })
            .then(res => {
                console.log(res.data);
            })
            .catch(err=> console.log(err))
    }

    //입력하는 값이 변경되면 호출됨
    function setFormData(event) {
        const { name, value } = event.target;

        setModData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    return(
        <div>
            <form onSubmit={pwdCheck}>
                <label>기존 비밀번호</label>
                <input type='password' id="user_pw" name="user_pw" onChange={setFormData}/><br/>

                <input type="submit" value="비밀번호 확인" />
            </form>

            <label>비밀번호 재설정</label>
            <input type='password' id="modUserPw" name="modUserPw"/><br/>
            
            <label>비밀번호 재설정 확인</label>
            <input type='password' id="modUserPwCheck" name="modUserPwCheck" /><br/>
        </div>
    )
}

export default MyPwdEdit;