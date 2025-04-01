import MyPageHeader from "./MyPageHeader";
import MyPageNav from "./MyPageNav";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import '../../../css/view/mypage.css';

function MyIndex(){
    const location = useLocation();
    const [path, setPath] = useState({f_name:'',l_name:''});
    useEffect(()=> {
        let pathname = location.pathname.split('/');
        if(pathname[2] == 'profile') setPath({f_name:'내 정보', l_name:'프로필'});
        else if(pathname[2] == 'edit') setPath({f_name:'내 정보', l_name:'개인 정보 수정'});
        else if(pathname[2] == 'posts') setPath({f_name:'나의 활동', l_name:'작성한 글'});
        else if(pathname[2] == 'wish') setPath({f_name:'보관함', l_name:'장바구니'});        
        else setPath({f_name:pathname[pathname.length-2], l_name:pathname[pathname.length-1]});
    },[location])

    return(<>
        <div className='mypage-container'>
            <MyPageHeader path={path} setPath={setPath}/>
            <MyPageNav path={path} setPath={setPath}/>
        </div>
    </>)
}

export default MyIndex;