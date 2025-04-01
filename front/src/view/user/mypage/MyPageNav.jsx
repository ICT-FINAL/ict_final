import { Link } from "react-router-dom";

function MyPageNav({path,setPath}){
    return(
        <div className='mypage-nav'>
            <ul>
                <li>내 정보</li>
                <li><Link to="/mypage/profile">프로필</Link></li>
                <li><Link to="/mypage/edit">개인 정보 수정</Link></li>
            </ul>
            <ul>
                <li>나의 활동</li>
                <li><Link to="/mypage/posts">작성한 글</Link></li>
                <li><Link to="/mypage/reviews">리뷰 관리</Link></li>
                <li><Link to="/mypage/comments">댓글 관리</Link></li>
                <li><Link to="/mypage/reports">신고 내역</Link></li>
                <li><Link to="/mypage/inquiries">문의 내역</Link></li>
            </ul>
            <ul>
                <li>거래 내역</li>
                <li><Link to="/mypage/purchases">구매 기록</Link></li>
                <li><Link to="/mypage/sales">판매 기록</Link></li>
            </ul>
            <ul>
                <li>보관함</li>
                <li><Link to="/mypage/wish">장바구니</Link></li>
                <li><Link to="/mypage/coupons">쿠폰함</Link></li>
                <li><Link to="/mypage/points">적립 내역</Link></li>
            </ul>
            <ul>
                <li>통계</li>
                <li><Link to="/mypage/stats/activity">활동 통계</Link></li>
                <li><Link to="/mypage/stats/purchases">구매 통계</Link></li>
                <li><Link to="/mypage/stats/sales">판매 통계</Link></li>
            </ul>
            <ul>
                <li>회원 탈퇴</li>
                <li><Link to="/mypage/delete-account">회원 탈퇴</Link></li>
            </ul>

        </div>
    )
}

export default MyPageNav;