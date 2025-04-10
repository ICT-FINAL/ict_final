import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MySell() {
    const loc = useLocation();
    const serverIP = useSelector((state) => { return state.serverIP });
    const user = useSelector((state) => state.auth.user);


    const [order, setOrder] = useState([]);

    useEffect(() => {
        getBoardList();
    }, []);

    useEffect(() => {
        getBoardList();
    }, [loc]);

    const getBoardList = () => {
        if (user)
            axios.get(`${serverIP.ip}/order/sellList`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    console.log(res.data);
                    setOrder(res.data);
                })
                .catch(err => console.log(err));
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

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
                                    <div className="order-header">
                                        <label>구매자:</label> <span className="message-who" id={`mgx-${item.user.id}`} style={{cursor:'pointer'}}>{item.user.username}</span>
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
        </div>
    );
}

export default MySell;
