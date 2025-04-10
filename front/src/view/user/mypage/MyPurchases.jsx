import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MyPurchases() {
    const loc = useLocation();
    const serverIP = useSelector((state) => { return state.serverIP });
    const user = useSelector((state) => state.auth.user);

    const [totalPage, setTotalPage] = useState(1);
    const [pageNumber, setPageNumber] = useState([]);

    const [order, setOrder] = useState([]);

    const [nowPage, setNowPage] = useState(1);

    const [totalRecord, setTotalRecord] = useState(1);

    const [searchOption, setSearchOption] = useState('');

    useEffect(() => {
        getBoardList();
        const det = document.querySelectorAll(".report-detail");
        if (det)
            det.forEach((det) => (det.style.display = "none"));
    }, [nowPage]);

    useEffect(() => {
        getBoardList();
    }, [loc, searchOption]);

    const getBoardList = () => {
        if (user)
            axios.get(`${serverIP.ip}/order/orderList?nowPage=${nowPage}&state=${searchOption}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    console.log(res.data);
                    const newPageNumbers = [];
                    for (let p = res.data.pvo.startPageNum; p < res.data.pvo.startPageNum + res.data.pvo.onePageCount; p++) {
                        if (p <= res.data.pvo.totalPage) {
                            newPageNumbers.push(p);
                        }
                    }
                    setPageNumber(newPageNumbers);
                    setTotalPage(res.data.pvo.totalPage);
                    setOrder(res.data.orderList);
                    setNowPage(res.data.pvo.nowPage);
                    setTotalRecord(res.data.pvo.totalRecord);
                })
                .catch(err => console.log(err));
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    // 상태에 맞는 텍스트와 색상을 반환하는 함수
    const getStateLabel = (state) => {
        switch (state) {
            case 'BEFORE':
                return { label: '결제 전', color: '#bdc3c7' };
            case 'PAID':
                return { label: '결제 완료', color: '#2ecc71' };
            case 'CANCELED':
                return { label: '결제 취소', color: '#e74c3c' };
            case 'FAILED':
                return { label: '결제 실패', color: '#e74c3c' };
            case 'RETURNED':
                return { label: '환불 됨', color: '#f39c12' }; 
            default:
                return { label: '알 수 없음', color: '#7f8c8d' };
        }
    };

    return (
        <div className="report-box">
            <select onChange={(e)=> setSearchOption(e.target.value)} style={{width:'120px', borderRadius:'10px', padding:'5px 10px', border:'1px solid #ddd'}}>
                <option value="">전체</option>
                <option value="PAID">결제 완료</option>
                <option value="CANCELED">결제 취소</option>
            </select>
            {
                order.length === 0 ?
                    <div className="no-list">검색 결과가 없습니다.</div> :
                    <div className="order-list">
                        {order.map((item) => {
                            let sum = 0;
                            return (
                                <div className="order-card" key={item.orderNum}>
                                    <div className="order-header">
                                        <label>주문 번호:</label> <span>{item.orderNum}</span>
                                    </div>
                                    <div className="order-header">
                                        <label>주문 날짜:</label> <span>{item.modifiedDate.substring(0, 19)}</span>
                                    </div>

                                    <div className="order-items">
                                        {item.orderItems.map((oi) => {
                                            const itemTotal = (oi.price * (100 - oi.discountRate) / 100 + oi.additionalFee) * oi.quantity;
                                            sum += itemTotal;
                                            return (
                                                <div className="order-item" key={oi.productName + oi.optionName}>
                                                    <div className="product-details">
                                                        <strong>{oi.productName} - {oi.optionName}</strong>
                                                        <div className="item-price" style={{ marginTop: '5px' }}>
                                                            {oi.optionCategoryName}(+{oi.additionalFee}원) x {oi.quantity} = {formatNumberWithCommas(itemTotal)}원
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="order-summary">
                                        <div><strong>합계:</strong> {formatNumberWithCommas(sum)}원</div>
                                        {item.couponDiscount !== 0 && (
                                            <div className="discount">
                                                <strong>쿠폰 할인:</strong> <span style={{ color: '#007bff' }}>-{formatNumberWithCommas(item.couponDiscount)}원</span>
                                            </div>
                                        )}
                                        {item.shippingFee !== 0 && (
                                            <div className="shipping-fee">
                                                <strong>배송비:</strong> <span style={{ color: '#e74c3c' }}>+{formatNumberWithCommas(item.shippingFee)}원</span>
                                            </div>
                                        )}
                                        <div className="final-total">
                                            <strong>최종 결제 금액:</strong> {formatNumberWithCommas(sum - item.couponDiscount + item.shippingFee)}원
                                        </div>
                                    </div>

                                    <div className="order-info">
                                        <div><strong>요청사항:</strong> {item.request}</div>
                                        <div><strong>배송지:</strong> {item.address.address} / {item.address.addressDetail}</div>
                                        <div className="order-state">
                                            <span className="order-state-label" style={{ backgroundColor: getStateLabel(item.state).color }}>
                                                {getStateLabel(item.state).label}
                                            </span>
                                        </div>
                                        <div><strong>수령인:</strong> {item.address.recipientName}</div>
                                        <div><strong>전화번호:</strong> {item.address.tel}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
            }
            <ul className="admin-paging">
                {nowPage > 1 && (
                    <a className="page-prenext" onClick={() => setNowPage(nowPage - 1)}>
                        <li className="page-num">◀</li>
                    </a>
                )}
                {pageNumber.map((pg) => {
                    const activeStyle = nowPage === pg ? 'page-num active' : 'page-num';
                    return (
                        <a className="page-num" onClick={() => setNowPage(pg)} key={pg}>
                            <li className={activeStyle}>{pg}</li>
                        </a>
                    );
                })}
                {nowPage < totalPage && (
                    <a className="page-prenext" onClick={() => setNowPage(nowPage + 1)}>
                        <li className="page-num">▶</li>
                    </a>
                )}
            </ul>
        </div>
    );
}

export default MyPurchases;
