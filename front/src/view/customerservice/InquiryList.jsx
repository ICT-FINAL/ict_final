import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import '../../css/view/InquiryList.css';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';

function InquiryList(){
    const [inquiryList, setInquiryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);


    useEffect(()=>{
        if (!user || !user.user || !user.user.id) {
            setError("로그인을 해주세요.");
            setLoading(false);
            navigate('/');
            return;
        }
        getInquiryList();
    },[]);

    function getInquiryList(){
        axios.get(`${serverIP.ip}/inquiry/inquiryList`,{
            headers:{
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(response => {
            console.log("API 응답 데이터:", response.data); // 응답 구조 확인용 로그
            if (Array.isArray(response.data)) {
                const formattedList = response.data.map(record => ({
                    id: record.id,
                    type:record.inquiryType,
                    subject: record.inquirySubject,
                    status: record.inquiryStatus,
                    writedate: record.inquiryWritedate
                }));
                setInquiryList(formattedList);
            } 
        })
        .catch(error=>{
            console.log(error);
            setInquiryList([]);
        })
    }
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error(e);
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
            default: return type;
        }
    };

    return (
        <div className="inquiry-list-container">
            <h1 className="main-title">나의 문의 내역</h1>

            {inquiryList.length === 0 ? (
                <p className="no-inquiries-message">작성된 문의 내역이 없습니다.</p>
            ) : (
                <table className="inquiry-table">
                    <thead>
                        <tr>
                            <th>문의 유형</th>
                            <th>제목</th>
                            <th>작성일</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiryList.map((inquiry) => (
                            <tr key={inquiry.id}>
                                <td>{translateInquiryType(inquiry.inquiryType)}</td>
                                <td className="inquiry-subject">
                                    <Link to={`/inquiry/inquiryview/${inquiry.id}`}>
                                        {inquiry.inquirySubject}
                                    </Link>
                                </td>
                                <td>{formatDate(inquiry.inquiryWritedate)}</td>
                                <td>{inquiry.inquiryStatus || '답변대기'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="button-group">
                <button onClick={() => navigate('/customerservice/InquiryWrite')} className="btn btn-primary">
                    문의 하기
                </button>
            </div>
        </div>
    );
}
export default InquiryList;