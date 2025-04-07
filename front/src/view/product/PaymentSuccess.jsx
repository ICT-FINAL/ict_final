import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");

    setOrderId(orderIdParam);
    setAmount(amountParam);

    fetch("http://localhost:9977/payment/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentKey,
        orderId: orderIdParam,
        amount: amountParam
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("결제 성공:", data);
      })
      .catch((err) => {
        console.error("결제 승인 실패:", err);
      });
  }, [searchParams]);

  return (
    <div style={{ padding: "100px" }}>
      <h2>결제가 성공적으로 완료되었습니다!</h2>
      <p><strong>주문번호:</strong> {orderId}</p>
      <p><strong>결제금액:</strong> {amount}원</p>
      <p>고객님 감사합니다 😊</p>
      <button onClick={() => navigate("/")} style={{ marginTop: "30px", padding: "10px 20px" }}>
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default PaymentSuccess;
