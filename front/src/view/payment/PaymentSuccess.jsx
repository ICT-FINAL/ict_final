import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");

    setOrderId(orderIdParam);
    setAmount(amountParam);

    fetch("http://localhost:9977/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId: orderIdParam, amount: amountParam }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("결제 성공:", data);
        return fetch(`http://localhost:9977/shipping/create-after-payment?orderNumber=${orderIdParam}&receiverName=홍길동`, {
          method: "POST",
        });
      })
      .then((res) => res.json())
      .then((shippingData) => {
        console.log("배송 생성:", shippingData);
        setInvoiceNumber(shippingData.invoiceNumber);
      })
      .catch((err) => {
        console.error("배송 생성 실패:", err);
      });
  }, [searchParams]);

  const handleCopy = () => {
    navigator.clipboard.writeText(invoiceNumber);
    alert("송장번호가 복사되었습니다!");
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "0 auto",          
  paddingTop: "200px",
      textAlign: "center"
   
    }}>
      <h2 style={{ marginBottom: "24px" }}>결제가 성공적으로 완료되었습니다!</h2>
      <p><strong>주문번호:</strong> {orderId}</p>
      <p><strong>결제금액:</strong> {amount}원</p>
    
      {invoiceNumber && (
        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px"
        }}>
          <span><strong>송장번호:</strong> {invoiceNumber}</span>
          <button
            onClick={handleCopy}
            style={{
              padding: "6px 14px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              cursor: "pointer"
            }}
          >
            송장번호 복사하기
          </button>
        </div>
      )}
    
      <div style={{
        marginTop: "30px",
        display: "flex",
        justifyContent: "center",
        gap: "16px"
      }}>
        <button onClick={() => navigate(`/shipping/track?invoiceNumber=${invoiceNumber}`)} style={buttonStyle}>
          배송 조회하기
        </button>
        <button onClick={() => navigate("/")} style={buttonStyle}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
    
  );
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#000",
  color: "#fff",
  cursor: "pointer",
};

export default PaymentSuccess;
