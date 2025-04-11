import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MySell() {
    const loc = useLocation();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [nowPage, setNowPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(1);
    const [orderList, setOrderList] = useState([]);

    const pageSize = 5;
    const pagedOrderList = orderList.slice((nowPage - 1) * pageSize, nowPage * pageSize);

    useEffect(() => {
        getBoardList();
    }, []);

    useEffect(() => {
        getBoardList();
    }, [loc]);

    useEffect(() => {
        setTotalPage(Math.ceil(orderList.length / pageSize));
    }, [orderList]);

    const getBoardList = () => {
        if (user)
            axios.get(`${serverIP.ip}/order/sellList`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    setOrderList(res.data);
                    setTotalRecord(res.data.length);
                })
                .catch(err => console.log(err));
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    return (
        <div className="report-box">
            {
                orderList.length === 0 ?
                    <div className="no-list">검색 결과가 없습니다.</div> :
                    <div className="order-list">
                        {pagedOrderList.map((order) => {
                            let orderSum = 0;
                            return (
                                <div className="order-section" key={order.id} style={{ border: '1px solid #ddd' }}>
                                    <div className="order-info">
                                        <strong>주문번호:</strong> {order.orderNum}<br />
                                        <strong>배송지:</strong> {order.address.address} / {order.address.addressDetail}<br />
                                        <strong>구매자:</strong> <span style={{ cursor: 'pointer' }} className="message-who" id={`mgx-${order.user.id}`}>{order.user.username}</span><br />
                                        <strong>수령인:</strong> {order.address.recipientName}<br />
                                        <strong>전화번호:</strong> {order.address.tel}<br />
                                        <strong>요청사항:</strong> {order.request}<br />
                                    </div>

                                    {order.orderItems.map((oi) => {
                                        const itemTotal = (oi.price * (100 - oi.discountRate) / 100 + oi.additionalFee) * oi.quantity;
                                        orderSum += itemTotal;
                                        return (
                                            <div className="order-item" key={oi.id}>
                                                <div className="product-details">
                                                    <strong>{oi.productName} - {oi.optionName}</strong>
                                                    <div style={{ marginTop: '5px' }}>
                                                        {oi.optionCategoryName} : {formatNumberWithCommas(oi.price)}원 <strong style={{ color: '#e74c3c' }}>(-{formatNumberWithCommas(oi.discountRate * oi.price / 100)}원)</strong> <strong style={{ color: '#1976d2' }}>(+{oi.additionalFee}원)</strong> x {oi.quantity} = <strong>{formatNumberWithCommas(itemTotal)}</strong>원
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="order-total">
                                        <div><strong>소계:</strong> {formatNumberWithCommas(orderSum)}원</div>
                                        {order.shippingFee !== 0 && (
                                            <div className="shipping-fee">
                                                <strong>배송비:</strong> +{formatNumberWithCommas(order.shippingFee)}원
                                            </div>
                                        )}
                                    </div>
                                    <div className="final-total">
                                        <strong>최종 결제 금액:</strong> {formatNumberWithCommas(orderSum + order.shippingFee)}원
                                    </div>
                                </div>
                            );
                        })}

                        <ul className="admin-paging">
                            {nowPage > 1 && (
                                <a className="page-prenext" onClick={() => setNowPage(nowPage - 1)}>
                                    <li className="page-num">◀</li>
                                </a>
                            )}
                            {Array.from({ length: totalPage }, (_, i) => i + 1).map((pg) => {
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
            }
        </div>
    );
}

export default MySell;
