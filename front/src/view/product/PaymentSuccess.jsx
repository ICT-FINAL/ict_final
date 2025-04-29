import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");

  const user = useSelector((state) => state.auth.user);
  const serverIP = useSelector((state) => state.serverIP);

  const location = useLocation();

  const basketNos = searchParams.get("basketNos")?.split(',').map(Number) || [];

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");
    const couponId = searchParams.get("couponId");
    const iid = searchParams.get('iid');
    setOrderId(orderIdParam);
    setAmount(amountParam);
  
    if (user) {
      fetch(`${serverIP.ip}/payment/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          paymentKey,
          orderId: orderIdParam,
          amount: amountParam,
          iid: iid,
          couponId: couponId
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "결제 승인 중 에러 발생");
          }
          return res.json();
        })
        .then((data) => {
          console.log("결제 성공:", data);
          axios.delete(`${serverIP.ip}/basket/paid/delete`, {
            headers: { Authorization: `Bearer ${user.token}` },
            data: { basketNos }
          })
            .then(() => {
              console.log("결제된 장바구니 항목 삭제 완료");
            })
            .catch((err) => console.error("삭제 오류:", err));
        })
        .catch((err) => {
          console.error("결제 승인 실패:", err);
          if (err.message === "quantity_over") {
            alert("결제 중 재고가 부족해 구매를 완료할 수 없습니다.");
          } else {
            alert("결제 승인 중 오류가 발생했습니다.");
          }
          navigate("/product/search");
        });
    }
  }, [searchParams]);
  

  function formatNumberWithCommas(num) {
    return num.toLocaleString();
  }

  return (
    <div className="product-payment-container" style={{ paddingTop: '250px' }}>
      <div className="product-payment-header">
        <h2>결제가 성공적으로 완료되었습니다</h2>
      </div>

      <div className="product-payment-info">
        <p className="product-payment-order-id">
          <strong>주문번호:</strong> {orderId}
        </p>
        <p className="product-payment-amount">
          <strong>결제금액:</strong> {formatNumberWithCommas(parseInt(amount, 10))}원
        </p>
        <p className="product-payment-thank-you">
          '{ user && user.user.username}'님 감사합니다 😊
        </p>
      </div>

      <div className="product-payment-buttons">
        <button
          onClick={() => navigate("/mypage/purchases")}
          className="product-payment-btn"
        >
          주문 내역으로
        </button>
        <button
          onClick={() => navigate("/")}
          className="product-payment-btn"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;