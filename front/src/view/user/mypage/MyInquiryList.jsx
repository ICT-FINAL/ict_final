import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import '../../../css/view/MyInquiryList.css';

function MyInquiryList() {
    const [inquiryList, setInquiryList] = useState([]);
    const navigate = useNavigate();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const headerClassName = "inquiry-list-header";
    const listClassName = "mypage-inquiry-list";

    useEffect(() => {
        if (!user || !user.user || !user.user.id) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
            return;
        }
        getInquiryList();
    }, [user, navigate, serverIP]);

    function getInquiryList() {
        axios.get(`${serverIP.ip}/inquiry/inquiryList`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(response => {
            if (Array.isArray(response.data)) {
                const formattedList = response.data.map(record => ({
                    id: record.id,
                    inquiryType: record.inquiryType,
                    inquirySubject: record.inquirySubject,
                    inquiryStatus: record.inquiryStatus,
                    inquiryWritedate: record.inquiryWritedate
                }));
                setInquiryList(formattedList);
            }
        })
        .catch(error => {
            setInquiryList([]);
        })
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '-';
            }
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error("날짜 포맷팅 오류:", e);
            return '-';
        }
    };

    const translateInquiryType = (type) => {
        switch (type) {
            case 'account': return '계정';
            case 'delivery': return '배송';
            case 'payment': return '결제';
            case 'refund': return '환불/교환';
            case 'coupon': return '쿠폰/이벤트';
            case 'etc': return '기타';
            default: return type || '알 수 없음';
        }
    };

    return (
        <div className="inquiry-list-container">
            <ul className={headerClassName}>
                <li>번호</li>
                <li>문의 유형</li>
                <li>제목</li>
                <li>작성일</li>
                <li>상태</li>
            </ul>
            {inquiryList.length === 0 ? (
                <div className="no-inquiries-message">
                    작성된 문의 내역이 없습니다.
                </div>
            ) : (
                inquiryList.map((inquiry) => (
                    <ul key={inquiry.id} className={listClassName}>
                        <li>
                            {inquiry.id}
                        </li>
                        <li>
                            {translateInquiryType(inquiry.inquiryType)}
                        </li>
                        <li>
                            <Link to={`/inquiry/inquiryview/${inquiry.id}`}>
                                {inquiry.inquirySubject}
                            </Link>
                        </li>
                        <li>
                            {formatDate(inquiry.inquiryWritedate)}
                        </li>
                        <li>
                            {inquiry.inquiryStatus ==="NOANSWER" ? "답변 대기" :"답변 완료"}
                        </li>
                    </ul>
                ))
            )}
        </div>
    );
}

export default MyInquiryList;