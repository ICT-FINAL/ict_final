import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MyPurchases() {
    const loc = useLocation();
    const serverIP = useSelector((state) => { return state.serverIP });
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [totalPage, setTotalPage] = useState(1);
    const [pageNumber, setPageNumber] = useState([]);

    const [order, setOrder] = useState([]);

    const [nowPage, setNowPage] = useState(1);

    const [totalRecord, setTotalRecord] = useState(1);

    const [searchOption, setSearchOption] = useState('');
    const [shippingOption, setShippingOption] = useState('');

    const moveInfo = (prodId) => {
        if(user)
            axios.get(`${serverIP.ip}/product/getInfo?productId=${prodId}`,{
                headers:{Authorization:`Bearer ${user.token}`}
            })
            .then(res =>{
                navigate('/product/info', { state: { product: res.data } });
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getBoardList();
    }, [nowPage]);

    useEffect(() => {
        getBoardList();
    }, [loc, searchOption, shippingOption]);

    const getBoardList = () => {
        if (user)
            axios.get(`${serverIP.ip}/order/orderList?nowPage=${nowPage}&state=${searchOption}&shippingState=${shippingOption}`, {
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                return { label: '전체 환불', color: '#e74c3c' };
            case 'PARTRETURNED':
                return { label: '부분 환불', color: '#f39c12' };
            default:
                return { label: '알 수 없음', color: '#7f8c8d' };
        }
    };

    const endShipping = (id) => {
        if(user){
            const isConfirmed = window.confirm("정말로 배송 완료 처리 하시겠습니까?\n배송 완료 후에는 환불이 불가능합니다.");
            if (!isConfirmed) return;
            axios.get(`${serverIP.ip}/shipping/finishShipping?orderId=${id}`,{
                headers:{Authorization:`Bearer ${user.token}`}
            })
            .then(res =>{
                window.alert("정상 처리되었습니다.");
                getBoardList();
            })
            .catch(err => console.log(err))
        }
    }

    const refundOrder = (orderId) => {
        if (user) {
            const isConfirmed = window.confirm("정말로 환불 하시겠습니까?");
            if (!isConfirmed) return;
            axios.get(`${serverIP.ip}/order/refundOrder?orderId=${orderId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
                if(res.data === "ok"){
                    window.alert("정상 환불 처리되었습니다.");
                    getBoardList();
                }
            })
            .catch(err => {
                console.log(err);
                alert('오류가 발생했습니다.');
            });
        }
    };

    return (
        <div className="report-box">
            <select onChange={(e) => setSearchOption(e.target.value)} style={{ width: '120px', borderRadius: '10px', padding: '5px 10px', border: '1px solid #ddd'}}>
                <option value="">전체</option>
                <option value="PAID">결제 완료</option>
                <option value="CANCELED">결제 취소</option>
                <option value="RETURNED">전체 환불</option>
                <option value="PARTRETURNED">부분 환불</option>
            </select>
            {order.length === 0 ? (
                <div className="no-list">검색 결과가 없습니다.</div>
            ) : (
                <div className="order-group-list">
                    {order.map((group) => (
                        <div className="order-group-card" key={group.id}>
                            <div className="group-header">
                                { group.orders.length >0 &&
                                <div>
                                    <strong>주문일:</strong> {group.orderDate?.substring(0, 19)} <br/>
                                    <strong>배송지:</strong> {group.orders[0].address.address} / {group.orders[0].address.addressDetail}<br />
                                    <strong>수령인:</strong> {group.orders[0].address.recipientName}<br />
                                    <strong>전화번호:</strong> {group.orders[0].address.tel}<br />
                                    <strong>요청사항:</strong> {group.orders[0].request}<br />
                                </div>
                                }  
                                <div>
                                    <span style={{ backgroundColor: getStateLabel(group.state).color }} className="order-state-label">
                                        {getStateLabel(group.state).label}
                                    </span>
                                </div>
                            </div>

                            {group.orders.map((order) => {
                                let orderSum = 0;
                                return (
                                    <div className="order-section" key={order.id}>
                                        <div className="order-info">
                                            <strong>주문번호:</strong> {order.orderNum}<br />
                                        </div>
                                        <div className='order-wrapper'>
                                            <div style={{textAlign:'center'}}>
                                                <img style={{width:`200px`, height:`200px`, borderRadius:'10px', cursor:'pointer'}} onClick={()=>moveInfo(order.productId)} src={`${serverIP.ip}/uploads/product/${order.productId}/${order.filename}`}/>
                                            </div>
                                            <div>
                                            {order.orderItems.map((oi) => {
                                                const itemTotal = (oi.price * (100 - oi.discountRate) / 100 + oi.additionalFee) * oi.quantity;
                                                orderSum += itemTotal;
                                                return (
                                                    <div className="order-item" key={oi.id} style={{cursor:'pointer'}} onClick={()=>moveInfo(order.productId)}>
                                                        <div className="product-details">
                                                            <strong>{oi.productName}<br/>{oi.optionName}</strong>
                                                            <div style={{ marginTop: '5px' }}>
                                                                {oi.optionCategoryName} : {formatNumberWithCommas(oi.price)}원 <strong style={{ color: '#e74c3c' }}>(-{formatNumberWithCommas(oi.discountRate * oi.price / 100)}원)</strong> <strong style={{ color: '#1976d2' }}>(+{formatNumberWithCommas(oi.additionalFee)}원)</strong> x {formatNumberWithCommas(oi.quantity)} = <strong>{formatNumberWithCommas(itemTotal)}</strong>원
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            </div>
                                        </div>
                                        <div className="order-total">
                                            <div style={{fontSize:'20px'}}><strong>소계:</strong> {formatNumberWithCommas(orderSum)}원</div>
                                            {order.shippingFee !== 0 && (
                                                <div className="shipping-fee">
                                                    <strong>배송비:</strong> +{formatNumberWithCommas(order.shippingFee)}원
                                                </div>
                                            )}
                                            <div style={{ marginTop: '10px' }}>
                                            <strong>배송 상태:</strong>{' '}
                                            {order.shippingState === 'BEFORE' && (
                                                <span style={{ color: '#888', fontWeight: '600' }}>
                                                ⏳ 배송 준비 중
                                                </span>
                                            )}
                                            {order.shippingState === 'ONGOING' && (
                                                <span style={{ color: '#007bff', fontWeight: '600' }}>
                                                🚚 배송 중
                                                </span>
                                            )}
                                            {order.shippingState === 'FINISH' && (
                                                <span style={{ color: '#28a745', fontWeight: '600' }}>
                                                ✅ 배송 완료
                                                </span>
                                            )}
                                            {order.shippingState === 'CANCELED' && (
                                                <span style={{ color: '#dc3545', fontWeight: '600' }}>
                                                ❌ 배송 취소
                                                </span>
                                            )}
                                            </div>
                                        </div>
                                        {order.shippingState==='ONGOING' && <><button style={{marginTop:'20px', cursor:'pointer', border:'none', padding:'10px 20px'
                                        ,fontSize:'18px', borderRadius:'5px', backgroundColor:'#8CC7A5'
                                        }} onClick={()=>endShipping(order.id)}>배송 완료</button><button style={{marginLeft:'10px',marginTop:'20px', cursor:'pointer', border:'none', padding:'10px 20px'
                                            ,fontSize:'18px', borderRadius:'5px', backgroundColor:'#e74c3c', color:'white'
                                            }} onClick={()=>refundOrder(order.id)}>환불 신청</button></>}
                                        <br/>
                                        {order.shippingState==='ONGOING' && <><br/><span style={{color:'#e74c3c'}}>※배송 완료시 환불이 불가능 합니다. 배송 완료는 2주 내 자동으로 배송 완료상태로 변경됩니다.※</span></>}
                                    </div>
                                );
                            })}
                            <div style={{fontSize:'20px'}}>
                                <strong>누계:</strong> {formatNumberWithCommas(group.totalPrice)}원
                            </div>
                            <div className="group-summary">
                                {group.couponDiscount !== 0 && (
                                    <div className="discount">
                                        <strong>쿠폰 할인:</strong> -{formatNumberWithCommas(group.couponDiscount)}원
                                    </div>
                                )}
                                {(group.state == 'RETURNED' || group.state == 'PARTRETURNED') && (
                                    <div className="discount">
                                        <strong>총 환불액:</strong> -{formatNumberWithCommas(group.cancelAmount)}원
                                    </div>
                                )}
                                {group.totalShippingFee !== 0 && (
                                   <><div className="shipping-fee">
                                        <strong>총 배송비:</strong> +{formatNumberWithCommas(group.totalShippingFee)}원
                                    </div>
                                    {(group.state == 'RETURNED' || group.state == 'PARTRETURNED') && <><br/><span style={{color:'#e74c3c'}}>※배송비와 쿠폰은 환불이 불가능합니다.※</span></>}</>
                                )}
                                <div className="final-total">
                                    <strong>최종 결제 금액:</strong> {formatNumberWithCommas(group.totalPrice + group.totalShippingFee - group.couponDiscount - group.cancelAmount)}원
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
