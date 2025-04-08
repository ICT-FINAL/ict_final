import MyPageHeader from "./MyPageHeader";
import MyPageNav from "./MyPageNav";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import MyBasket from "./MyBasket";
import MyReport from "./MyReport";
import MyPageProfile from "./MyPageProfile";

import '../../../css/view/mypage.css';
import MyWish from "./MyWish";
import MyInquiryList from "./MyInquiryList";

function MyIndex(){
    const location = useLocation();
    const [path, setPath] = useState({f_name:'',l_name:''});
    
    useEffect(() => {
        window.scrollTo({top:0,left:0,behavior:'smooth'});
        let pathname = location.pathname.split("/");
        let page = pathname[2];
        const pathMap = {
            profile: { f_name: "내 정보", l_name: "프로필" },
            edit: { f_name: "내 정보", l_name: "개인 정보 수정" },
            posts: { f_name: "나의 활동", l_name: "작성한 글" },
            reviews: { f_name: "나의 활동", l_name: "리뷰 관리" },
            comments: { f_name: "나의 활동", l_name: "댓글 관리" },
            reports: { f_name: "나의 활동", l_name: "신고 내역" },
            inquiries: { f_name: "나의 활동", l_name: "문의 내역" },
            purchases: { f_name: "거래 내역", l_name: "구매 기록" },
            sales: { f_name: "거래 내역", l_name: "판매 기록" },
            basket: { f_name: "보관함", l_name: "장바구니" },
            coupons: { f_name: "보관함", l_name: "쿠폰함" },
            points: { f_name: "보관함", l_name: "적립 내역" },
            wishlist: { f_name:"보관함", l_name:"찜 목록"},
            "stats-activity": { f_name: "통계", l_name: "활동 통계" },
            "stats-purchases": { f_name: "통계", l_name: "구매 통계" },
            "stats-sales": { f_name: "통계", l_name: "판매 통계" },
            "delete-account": { f_name: "회원 탈퇴", l_name: "회원 탈퇴" },
        };

        if (pathMap[page]) {
            setPath(pathMap[page]);
        } else if (pathname.length > 3) {
            setPath({ f_name: pathname[pathname.length - 2], l_name: pathname[pathname.length - 1] });
        } else {
            setPath({ f_name: "마이페이지", l_name: "" });
        }
    }, [location]);


    return(<>
        <div className='mypage-container'>
        </div>
        <MyPageHeader path={path} setPath={setPath}/>
        <MyPageNav path={path} setPath={setPath}/>
        <div className='mypage-wrap'>
            <div className='mypage-box'>
            <div className='mypage-title'>{path.l_name}</div>
            { path.l_name == '프로필' && <MyPageProfile/> }
                  {path.l_name == '장바구니' && <MyBasket/>}
                  { path.l_name == '신고 내역' && <MyReport/> }
                  { path.l_name == '문의 내역' && <MyInquiryList/> }
                  { path.l_name == '찜 목록' && <MyWish/> }
            </div>
        </div>
    </>)
}

export default MyIndex;