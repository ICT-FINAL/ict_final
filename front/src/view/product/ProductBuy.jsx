import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function ProductBuy() {
  const location = useLocation();
  const { productId, totalPrice, productName, selectedOptions,shippingFee,selectedCoupon } = location.state || {};

  useEffect(()=> {
    console.log(selectedOptions);
  },[]);

  const finalPrice = totalPrice;
  const handlePayment = () => {
    if (!window.TossPayments) {
      alert("TossPayments SDK가 로드되지 않았습니다.");
      return;
    }
    const tossPayments = window.TossPayments("test_ck_ORzdMaqN3w2RZ1XBgmxM85AkYXQG");
    const orderId = "orderId-" + new Date().getTime();

    tossPayments
      .requestPayment("카드", {
        amount: finalPrice,
        orderId,
        orderName: productName,
        customerName: "홍길동",
        successUrl: `http://localhost:3000/payment/success`,
        failUrl: `http://localhost:3000/payment/fail`,
      })
      .catch((error) => {
        console.error("❌ 결제창 오류:", error);
      });
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

          {/* 결제 금액 최종 안내 */}
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

        <button className="payment-button" onClick={handlePayment}>결제하기</button>

        <div className="security-notice">
          <small>이 페이지는 안전한 결제를 제공합니다. 결제 정보는 암호화되어 처리됩니다.</small>
        </div>
      </div>
    </div>
  );
}

export default ProductBuy;
