import React from "react";
import { useLocation } from "react-router-dom";

function ProductBuy() {
  const location = useLocation();
  const { productId, totalPrice, productName,selectedOptions } = location.state || {};
  const handlePayment = () => {
    if (!window.TossPayments) {
      alert("TossPayments SDK가 로드되지 않았습니다.");
      return;
    }
    const tossPayments = window.TossPayments(
      "test_ck_ORzdMaqN3w2RZ1XBgmxM85AkYXQG"
    );
    const orderId = "orderId-" + new Date().getTime();
    console.log(selectedOptions);
    tossPayments
      .requestPayment("카드", {
        amount: totalPrice,
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

  return (
    <div style={{ padding: "100px" }}>
      <h2>상품 결제</h2>
      <p>상품명: {productName}</p>
      <p>가격: {totalPrice}원</p>
      <button onClick={handlePayment}>💳 결제하기</button>
    </div>
  );
}

export default ProductBuy;
