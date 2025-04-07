import React from "react";

function ProductBuy() {
  const handlePayment = () => {
    if (!window.TossPayments) {
        alert("TossPayments SDK가 로드되지 않았습니다.");
        return;
      }
    const tossPayments = window.TossPayments("test_ck_ORzdMaqN3w2RZ1XBgmxM85AkYXQG");
    const orderId = "orderId-" + new Date().getTime();
    const amount = 1000;

    tossPayments
  .requestPayment("카드", {
    amount,
    orderId,
    orderName: "테스트 상품",
    customerName: "홍길동",
    successUrl: `http://localhost:3000/payment/success`,
    failUrl: `http://localhost:3000/payment/fail`,
  })
      .catch((error) => {
        console.error("결제창 오류:", error);
      });
  };

  return (
    <div style={{ padding: "100px" }}>
      <h2>상품 결제</h2>
      <button onClick={handlePayment}>결제하기</button>
    </div>
  );
}

export default ProductBuy;
