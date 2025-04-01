import { useNavigate } from "react-router-dom";

function MyPageNav({ path }) {
    const clickedStyle = { fontWeight: "bold", backgroundColor: "#555" };
    const clickedStyle2 = { fontWeight: "bold", color: "#fff" };
    const navigate = useNavigate();

    return (
        <div className="mypage-nav">
            <ul>
                <li>내 정보</li>
                <li onClick={() => navigate("/mypage/profile")} style={path.l_name === "프로필" ? clickedStyle : {}}>
                    <span style={path.l_name === "프로필" ? clickedStyle2 : {}}>프로필</span>
                </li>
                <li onClick={() => navigate("/mypage/edit")} style={path.l_name === "개인 정보 수정" ? clickedStyle : {}}>
                    <span style={path.l_name === "개인 정보 수정" ? clickedStyle2 : {}}>개인 정보 수정</span>
                </li>
            </ul>
            <ul>
                <li>나의 활동</li>
                <li onClick={() => navigate("/mypage/posts")} style={path.l_name === "작성한 글" ? clickedStyle : {}}>
                    <span style={path.l_name === "작성한 글" ? clickedStyle2 : {}}>작성한 글</span>
                </li>
                <li onClick={() => navigate("/mypage/reviews")} style={path.l_name === "리뷰 관리" ? clickedStyle : {}}>
                    <span style={path.l_name === "리뷰 관리" ? clickedStyle2 : {}}>리뷰 관리</span>
                </li>
                <li onClick={() => navigate("/mypage/comments")} style={path.l_name === "댓글 관리" ? clickedStyle : {}}>
                    <span style={path.l_name === "댓글 관리" ? clickedStyle2 : {}}>댓글 관리</span>
                </li>
                <li onClick={() => navigate("/mypage/reports")} style={path.l_name === "신고 내역" ? clickedStyle : {}}>
                    <span style={path.l_name === "신고 내역" ? clickedStyle2 : {}}>신고 내역</span>
                </li>
                <li onClick={() => navigate("/mypage/inquiries")} style={path.l_name === "문의 내역" ? clickedStyle : {}}>
                    <span style={path.l_name === "문의 내역" ? clickedStyle2 : {}}>문의 내역</span>
                </li>
            </ul>
            <ul>
                <li>거래 내역</li>
                <li onClick={() => navigate("/mypage/purchases")} style={path.l_name === "구매 기록" ? clickedStyle : {}}>
                    <span style={path.l_name === "구매 기록" ? clickedStyle2 : {}}>구매 기록</span>
                </li>
                <li onClick={() => navigate("/mypage/sales")} style={path.l_name === "판매 기록" ? clickedStyle : {}}>
                    <span style={path.l_name === "판매 기록" ? clickedStyle2 : {}}>판매 기록</span>
                </li>
            </ul>
            <ul>
                <li>보관함</li>
                <li onClick={() => navigate("/mypage/wish")} style={path.l_name === "장바구니" ? clickedStyle : {}}>
                    <span style={path.l_name === "장바구니" ? clickedStyle2 : {}}>장바구니</span>
                </li>
                <li onClick={() => navigate("/mypage/coupons")} style={path.l_name === "쿠폰함" ? clickedStyle : {}}>
                    <span style={path.l_name === "쿠폰함" ? clickedStyle2 : {}}>쿠폰함</span>
                </li>
                <li onClick={() => navigate("/mypage/points")} style={path.l_name === "적립 내역" ? clickedStyle : {}}>
                    <span style={path.l_name === "적립 내역" ? clickedStyle2 : {}}>적립 내역</span>
                </li>
            </ul>
            <ul>
                <li>통계</li>
                <li onClick={() => navigate("/mypage/stats-activity")} style={path.l_name === "활동 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "활동 통계" ? clickedStyle2 : {}}>활동 통계</span>
                </li>
                <li onClick={() => navigate("/mypage/stats-purchases")} style={path.l_name === "구매 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "구매 통계" ? clickedStyle2 : {}}>구매 통계</span>
                </li>
                <li onClick={() => navigate("/mypage/stats-sales")} style={path.l_name === "판매 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "판매 통계" ? clickedStyle2 : {}}>판매 통계</span>
                </li>
            </ul>
            <ul>
                <li className='mypage-nav-title'>회원 탈퇴</li>
                <li onClick={() => navigate("/mypage/delete-account")} style={path.l_name === "회원 탈퇴" ? clickedStyle : {}}>
                    <span style={path.l_name === "회원 탈퇴" ? clickedStyle2 : {}}>회원 탈퇴</span>
                </li>
            </ul>
        </div>
    );
}

export default MyPageNav;
