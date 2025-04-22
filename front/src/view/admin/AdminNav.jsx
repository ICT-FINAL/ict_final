import { useNavigate } from "react-router-dom";

function AdminNav({ path }) {
    const clickedStyle = { fontWeight: "bold", backgroundColor: "#555" };
    const clickedStyle2 = { fontWeight: "bold", color: "#fff" };
    const navigate = useNavigate();

    return (
        <div className="admin-nav">
            <ul>
                <li>관리자 페이지</li>
                <li onClick={() => navigate("/admin/reportlist")} style={path.l_name === "신고 목록" ? clickedStyle : {}}>
                    <span style={path.l_name === "신고 목록" ? clickedStyle2 : {}}>신고 목록</span>
                </li>
                <li onClick={() => navigate("/admin/inquirylist")} style={path.l_name === "문의 목록" ? clickedStyle : {}}>
                    <span style={path.l_name === "문의 목록" ? clickedStyle2 : {}}>문의 목록</span>
                </li>
                <li onClick={() => navigate("/admin/edit")} style={path.l_name === "개인 정보 수정" ? clickedStyle : {}}>
                    <span style={path.l_name === "개인 정보 수정" ? clickedStyle2 : {}}>회원 목록</span>
                </li>
            </ul>
            <ul>
                <li>매출관리</li>
                <li onClick={() => navigate("/admin/posts")} style={path.l_name === "작성한 글" ? clickedStyle : {}}>
                    <span style={path.l_name === "작성한 글" ? clickedStyle2 : {}}>판매 통계</span>
                </li>
                <li onClick={() => navigate("/admin/reviews")} style={path.l_name === "리뷰 관리" ? clickedStyle : {}}>
                    <span style={path.l_name === "리뷰 관리" ? clickedStyle2 : {}}>수익 통계</span>
                </li>
                <li onClick={() => navigate("/admin/comments")} style={path.l_name === "댓글 관리" ? clickedStyle : {}}>
                    <span style={path.l_name === "댓글 관리" ? clickedStyle2 : {}}>정산 처리</span>
                </li>
                <li onClick={() => navigate("/admin/reports")} style={path.l_name === "신고 내역" ? clickedStyle : {}}>
                    <span style={path.l_name === "신고 내역" ? clickedStyle2 : {}}>환불 처리</span>
                </li>
                <li onClick={() => navigate("/admin/inquiries")} style={path.l_name === "문의 내역" ? clickedStyle : {}}>
                    <span style={path.l_name === "문의 내역" ? clickedStyle2 : {}}>배송 처리</span>
                </li>
            </ul>
            <ul>
                <li>거래 내역</li>
                <li onClick={() => navigate("/admin/purchases")} style={path.l_name === "구매 기록" ? clickedStyle : {}}>
                    <span style={path.l_name === "구매 기록" ? clickedStyle2 : {}}>구매 기록</span>
                </li>
                <li onClick={() => navigate("/admin/sales")} style={path.l_name === "판매 기록" ? clickedStyle : {}}>
                    <span style={path.l_name === "판매 기록" ? clickedStyle2 : {}}>판매 기록</span>
                </li>
            </ul>
            <ul>
                <li>보관함</li>
                <li onClick={() => navigate("/admin/basket")} style={path.l_name === "장바구니" ? clickedStyle : {}}>
                    <span style={path.l_name === "장바구니" ? clickedStyle2 : {}}>장바구니</span>
                </li>
                <li onClick={() => navigate("/admin/coupons")} style={path.l_name === "쿠폰함" ? clickedStyle : {}}>
                    <span style={path.l_name === "쿠폰함" ? clickedStyle2 : {}}>쿠폰함</span>
                </li>
                <li onClick={() => navigate("/admin/points")} style={path.l_name === "적립 내역" ? clickedStyle : {}}>
                    <span style={path.l_name === "적립 내역" ? clickedStyle2 : {}}>적립 내역</span>
                </li>
            </ul>
            <ul>
                <li>통계</li>
                <li onClick={() => navigate("/admin/salesbyperiod")} style={path.l_name === "판매 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "판매 통계" ? clickedStyle2 : {}}>판매 통계</span>
                </li>
                <li onClick={() => navigate("/admin/stats-activity")} style={path.l_name === "활동 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "활동 통계" ? clickedStyle2 : {}}>활동 통계</span>
                </li>
                <li onClick={() => navigate("/admin/stats-purchases")} style={path.l_name === "구매 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "구매 통계" ? clickedStyle2 : {}}>구매 통계</span>
                </li>
            </ul>
            <ul>
                <li className='admin-nav-title'>회원 탈퇴</li>
                <li onClick={() => navigate("/admin/delete-account")} style={path.l_name === "회원 탈퇴" ? clickedStyle : {}}>
                    <span style={path.l_name === "회원 탈퇴" ? clickedStyle2 : {}}>회원 탈퇴</span>
                </li>
            </ul>
        </div>
    );
}

export default AdminNav;
