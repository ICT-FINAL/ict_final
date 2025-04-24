import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { setModal } from "../../../store/modalSlice";

import axios from "axios";

function MySell() {
    const loc = useLocation();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [nowPage, setNowPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalRecord, setTotalRecord] = useState(1);
    const [orderList, setOrderList] = useState([]);
    const [fileList, setFileList] = useState([]);
    const pageSize = 5;
    const pagedOrderList = orderList.slice((nowPage - 1) * pageSize, nowPage * pageSize);
    const [shippingOption, setShippingOption] = useState('');
    const dispatch = useDispatch();
    const modal = useSelector((state)=>state.modal);
    const navigate = useNavigate();
    
    useEffect(() => {
        getBoardList();
    }, [modal]);

    useEffect(() => {
        getBoardList();
    }, [loc, shippingOption]);

    useEffect(() => {
        setTotalPage(Math.ceil(orderList.length / pageSize));
    }, [orderList]);

    const getBoardList = () => {
        if (user)
            axios.get(`${serverIP.ip}/order/sellList?shippingState=${shippingOption}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    setOrderList(res.data.orderList);
                    setTotalRecord(res.data.orderList.length);
                    setFileList(res.data.filenameList);
                })
                .catch(err => console.log(err));
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const setShipping = (id) => {
        dispatch(setModal({...modal, selected:'shipping', isOpen:true, info:{id:id}}));
    }

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

    return (
        <div className="report-box">
            <select onChange={(e) => setShippingOption(e.target.value)} style={{ width: '120px', borderRadius: '10px', padding: '5px 10px', border: '1px solid #ddd', marginBottom:'30px'}}>
                <option value="">전체</option>
                <option value="BEFORE">배송 준비 중</option>
                <option value="ONGOING">배송 중</option>
                <option value="FINISH">배송 완료</option>
                <option value="CANCELED">배송 취소</option>
            </select>
            {
                orderList.length === 0 ?
                    <div className="no-list">검색 결과가 없습니다.</div> :
                    <div className="order-list">
                        {pagedOrderList.map((order,idx) => {
                            let orderSum = 0;
                            return (
                                <div className="order-section" key={order.id} style={{ border: '1px solid #ddd' }}>
                                    <div className="order-info">
                                        <strong>주문번호:</strong> {order.orderNum}<br />
                                        <strong>주문일자:</strong> {order.startDate}<br/>
                                        <strong>배송지:</strong> {order.address.address} / {order.address.addressDetail}<br />
                                        <strong>구매자:</strong> <span style={{ cursor: 'pointer' }} className="message-who" id={`mgx-${order.user.id}`}>{order.user.username}</span><br />
                                        <strong>수령인:</strong> {order.address.recipientName}<br />
                                        <strong>전화번호:</strong> {order.address.tel}<br />
                                        <strong>요청사항:</strong> {order.request}<br />
                                    </div>
                                    <div className='order-wrapper'>
                                    { fileList[idx] &&
                                    <div style={{textAlign:'center'}}>
                                        <img  onClick={()=>moveInfo(order.productId)} style={{width:'200px', height:'200px', borderRadius:'10px', cursor:'pointer'}} src={`${serverIP.ip}/uploads/product/${order.productId}/${fileList[idx]}`}/>
                                    </div>
                                    }
                                    <div>
                                    {order.orderItems.map((oi) => {
                                        const itemTotal = (oi.price * (100 - oi.discountRate) / 100 + oi.additionalFee) * oi.quantity;
                                        orderSum += itemTotal;
                                        return (
                                            <div className="order-item" key={oi.id} onClick={()=>moveInfo(order.productId)} style={{cursor:'pointer'}}>
                                                <div className="product-details">
                                                    <strong>{oi.productName} - {oi.optionName}</strong>
                                                    <div style={{ marginTop: '5px' }}>
                                                        {oi.optionCategoryName} : {formatNumberWithCommas(oi.price)}원 <strong style={{ color: '#e74c3c' }}>(-{formatNumberWithCommas(oi.discountRate * oi.price / 100)}원)</strong> <strong style={{ color: '#1976d2' }}>(+{oi.additionalFee}원)</strong> x {oi.quantity} = <strong>{formatNumberWithCommas(itemTotal)}</strong>원
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    </div>
                                    </div>
                                    <div className="order-total">
                                        <div><strong>소계:</strong> {formatNumberWithCommas(orderSum)}원</div>
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
                                    <div className="final-total">
                                        <strong>최종 결제 금액:</strong> {formatNumberWithCommas(orderSum + order.shippingFee)}원
                                    </div>
                                    {order.shippingState==='BEFORE' && <button style={{marginTop:'20px', cursor:'pointer', border:'none', padding:'10px 20px'
                                        ,fontSize:'18px', borderRadius:'5px', backgroundColor:'#8CC7A5'
                                    }} onClick={()=>setShipping(order.id)}>배송 등록</button>}
                                     {order.shippingState==='ONGOING' && <><br/><span style={{color:'#e74c3c'}}>※구매자가 배송 완료 처리시 배송 완료 됩니다.※</span></>}
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
