import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AddressForm from "../user/AddressForm";
import { useSelector } from "react-redux";
import axios from "axios";

function ProductBuy() {
  const location = useLocation();
  const { productId, totalPrice, productName, selectedOptions,shippingFee,selectedCoupon } = location.state || {};

  const [selectedAddress, setSelectedAddress] = useState('');
  const [request, setRequest] = useState('');
  const [isGet, setIsGet] = useState(true);

  const [selAddrId,setSelAddrId] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const serverIP = useSelector((state)=> state.serverIP);

  useEffect(()=> {
    console.log(selectedOptions);
  },[]);

  const handleAddAddress = (newAddress) => {
    if (user)
      axios
          .post(`${serverIP.ip}/mypage/insertAddrList`, newAddress, {
              headers: { Authorization: `Bearer ${user.token}` },
          })
          .then((res) => {
            setIsGet(!isGet);
          })
          .catch((err) => {
              console.log(err);
          });
  };

  const finalPrice = totalPrice;
  const handlePayment = () => {
    if(selectedAddress == '' || selectedAddress == undefined) {
      alert("배송지를 선택해주세요")
      return;
    }
    if (!window.TossPayments) {
      alert("TossPayments SDK가 로드되지 않았습니다.");
      return;
    }
    const tossPayments = window.TossPayments("test_ck_ORzdMaqN3w2RZ1XBgmxM85AkYXQG");
    const orderId = new Date().getTime();

    console.log(selectedOptions);
    let options=[];
    for(var i=0; i<selectedOptions.length; i++) {
      options.push({
        optionCategoryId:selectedOptions[i].subOption.id,
        quantity:selectedOptions[i].quantity,
        coupon:selectedCoupon
      })
    }

    axios.post(`${serverIP.ip}/order/setOrder`,{options:options, addrId:selAddrId, req:request, orderId:orderId
      ,shippingFee:shippingFee, couponDiscount:selectedCoupon, productId:productId
    },{
      headers: { Authorization: `Bearer ${user.token}` },
    })
    .then(res => {
      const successUrl = `http://localhost:3000/payment/success?iid=${res.data.id}`;
      if(user)
        tossPayments
          .requestPayment("카드", {
            amount: parseInt(finalPrice),
            orderId,
            orderName: productName,
            customerName: user.user.username,
            successUrl: successUrl,
            failUrl: `http://localhost:3000/payment/fail`,
          })
          .catch((error) => {
            axios.get(`${serverIP.ip}/order/cancel?id=${res.data.id}`,{
              headers: { Authorization: `Bearer ${user.token}` },}
            )
            .then(res=>{
              console.log("결제 취소");
            })
            .catch(err => console.log(err));

            console.error("❌ 결제창 오류:", error);
          });
    })
    .catch(err => console.log(err));
  };
  
  function formatNumberWithCommas(num) {
    return num.toLocaleString();
  }

  return (
    <div style={{ paddingTop: '150px' }}>
      <div className="product-buy-container">
        <h2 className="product-buy-header">상품 결제</h2>
        <div className="product-buy-info">
          <h3 className="product-buy-name">{productName}</h3>
          <p className="buy-price">가격: {formatNumberWithCommas(totalPrice-shippingFee + selectedCoupon)}원</p>
          {selectedOptions && selectedOptions.length > 0 && (
            <div className="selected-options">
              <strong>선택된 옵션:</strong>
              <ul>
                {selectedOptions.map((item, index) => (
                  <li key={index} className="selected-option-item">
                    {item.option.optionName}
                    {item.subOption && ` - ${item.subOption.categoryName} (+${item.subOption.additionalPrice}원)`}
                    &nbsp;x {item.quantity} = {formatNumberWithCommas(item.option.product.price*(100-item.option.product.discountRate)/100*item.quantity)}원
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="shipping-discount-info">
            {shippingFee!== 0 &&<p className="shipping-fee">배송비: +{shippingFee}원</p>}
            {selectedCoupon!==0 && <p className="shipping-fee" style={{color:'#d9534f'}}>쿠폰: -{selectedCoupon}원</p>}
          </div>

          <div className="final-price">
            <strong>최종 결제 금액: {formatNumberWithCommas(finalPrice)}원</strong>
          </div>


          <div className="payment-method">
            <strong>결제 수단 선택: </strong>
            <select className="payment-select">
              <option value="card">카드 결제</option>
            </select>
          </div>
        </div>
        <div className='product-buy-info'>
        <AddressForm setSelAddrId={setSelAddrId} isGet={isGet} onAddAddress={handleAddAddress} setRequest={setRequest} request={request} setSelectedAddresses={setSelectedAddress}/>
        </div>
        <button className="payment-button" onClick={handlePayment}>결제하기</button>

        <div className="security-notice">
          <small>이 페이지는 안전한 결제를 제공합니다. 결제 정보는 암호화되어 처리됩니다.</small>
        </div>
      </div>
    </div>
  );
}

export default ProductBuy;
