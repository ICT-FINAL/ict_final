import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AddressForm from "../user/AddressForm";
import { useSelector } from "react-redux";
import axios from "axios";

function ProductBuy() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [purchasedItems, setPurchasedItems] = useState([]); // 단일 상품 또는 장바구니 아이템 배열
  const [isBasketPurchase, setIsBasketPurchase] = useState(false); // 장바구니 구매 여부
  const [selectedAddress, setSelectedAddress] = useState('');
  const [request, setRequest] = useState('');
  const [isGet, setIsGet] = useState(true);
  const [selAddrId, setSelAddrId] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const serverIP = useSelector((state) => state.serverIP);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
  const [totalShippingFee, setTotalShippingFee] = useState(0);
  const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);

  const [selectedCoupon, setSelectedCoupon] = useState(0);
  const [selectedCouponId, setSelectedCouponId] = useState(0);
  const [couponList, setCouponList] = useState([]);

  const [isAuction, setIsAuction] = useState(false);

  const handleCouponChange = (e) => {
    console.log(selectedCouponId);
    console.log(selectedCoupon);
    setSelectedCoupon(Number(e.target.value.split('-')[0]));
    const [discount, id] = e.target.value.split('-');
    setSelectedCoupon(Number(discount));
    setSelectedCouponId(Number(id));
  };

  const groupedItems = orderItems.reduce((acc, item) => {
    const key = item.productNo;
    if (!acc[key]) {
      acc[key] = {
        productNo: item.productNo,
        sellerName: item.sellerName,
        productName: item.productName,
        productPrice: item.productPrice,
        productDiscountRate: item.productDiscountRate,
        productShippingFee: item.productShippingFee,
        options: []
      };
    }
    acc[key].options.push({
      categoryName: item.categoryName,
      quantity: item.quantity,
      additionalPrice: item.additionalPrice,
    });
    return acc;
  }, {});

  useEffect(() => {
    if(user)
      axios.get(`${serverIP.ip}/interact/getCouponList`, {
        headers:{Authorization:`Bearer ${user.token}`}
      })
      .then(res => {
        setCouponList(res.data);
      })
      .catch(err=>console.log(err))
    if (state && state.basketItems) {
      setIsBasketPurchase(true);
      setPurchasedItems(state.basketItems);
    } else if (location.state && Array.isArray(location.state.selectedItems) && location.state.product) { // location.state.product 추가 확인
      if(location.state.selectedItems.length === 0) {
        setIsAuction(true);
        setTotalPaymentAmount(location.state.shippingFee + location.state.totalPrice - location.state.selectedCoupon);
        return;
      }
      setIsBasketPurchase(false);
      const items = location.state.selectedItems.map(item => {
        const discountRate = location.state.product.discountRate || 0;
        const discountedPrice = discountRate === 0
          ? location.state.product.price
          : location.state.product.price * (1 - discountRate / 100);
        const itemPrice = discountedPrice + (item.subOption?.additionalPrice || 0);

        return {
          optionCategoryId: item.subOption.id,
          productNo: location.state.product.id,
          sellerName: location.state.product.sellerNo?.username,
          productName: location.state.product.productName,
          categoryName: item.option?.optionName + (item.subOption ? `  ${item.subOption.categoryName}` : ''),
          productDiscountRate: discountRate,
          productPrice: location.state.product.price,
          quantity: item.quantity,
          productShippingFee: location.state.product.shippingFee || 0,
          additionalPrice: item.subOption?.additionalPrice || 0,
        };
      });
      setPurchasedItems(items);
    } else {
      alert("잘못된 접근입니다.");
      navigate('/basket');
      return;
    }
  }, [state, navigate, location.state]);

  useEffect(() => {
    if (purchasedItems && purchasedItems.length > 0) {
      setOrderItems(purchasedItems);
      let paymentTotal = 0;
      let discountTotal = 0;
      let shippingTotal = 0;

      const countedProductNos = new Set();

      purchasedItems.forEach(item => {
        const discountedPrice = item.productDiscountRate > 0
          ? item.productPrice * (1 - item.productDiscountRate / 100)
          : item.productPrice;

        paymentTotal += (discountedPrice + (item.additionalPrice || 0)) * item.quantity;
        discountTotal += (item.productPrice - discountedPrice) * item.quantity;

        if (!countedProductNos.has(item.productNo)) {
          shippingTotal += item.productShippingFee || 0;
          countedProductNos.add(item.productNo);
        }
      });

      setTotalPaymentAmount(paymentTotal + shippingTotal - selectedCoupon);
      setTotalShippingFee(shippingTotal);
      setTotalDiscountAmount(discountTotal + selectedCoupon);
    }
  }, [purchasedItems, selectedCoupon]);


  const handleAddAddress = (newAddress) => {
    if (user)
      axios
        .post(`${serverIP.ip}/mypage/insertAddrList`, newAddress, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then(() => setIsGet(!isGet))
        .catch((err) => console.log(err));
  };

  const handlePayment = () => {
    if (!selectedAddress) {
      alert("배송지를 선택해주세요.");
      return;
    }
    if (!window.TossPayments) {
      alert("TossPayments SDK가 로드되지 않았습니다.");
      return;
    }
    const orderId = new Date().getTime();
    const tossPayments = window.TossPayments("test_ck_ORzdMaqN3w2RZ1XBgmxM85AkYXQG");
    if(isAuction) {
      axios.post(`${serverIP.ip}/order/setAuctionOrder`, {
        productId: location.state.product.id,
        addrId: selAddrId,
        req: request,
        orderId: orderId,
        shippingFee: location.state.product.shippingFee,
        totalPrice: totalPaymentAmount
      },{
        headers:{Authorization:`Bearer ${user.token}`}
      })
      .then(res => {
        console.log(res.data);
        const successUrl = `${serverIP.front}/payment/auction/success?iid=${res.data.id}`;
          tossPayments
            .requestPayment("카드", {
              amount: parseInt(totalPaymentAmount),
              orderId,
              orderName: '경매 즉시구매',
              customerName: user.user.username,
              successUrl,
              failUrl: `${window.location.origin}/payment/fail`,
            })
            .catch(error => {
              console.error("결제 실패:", error);
              axios.get(`${serverIP.ip}/order/auctionCancel?orderId=${res.data.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
              }).catch(cancelErr => console.error("결제 취소 실패:", cancelErr));
              alert(`결제 실패: ${error.message}`);
            });
      })
      .catch(err => {
        console.log(err);
      })
      return;
    }
    const orderName = orderItems.length > 0 ? `${orderItems[0].productName} 외 ${orderItems.length - 1}건` : "주문";
    const productIds = orderItems.map(item => item.productNo);
    const orderDetails = [];
    const usedProductNos = new Set();
    orderItems.forEach(item => {
      orderDetails.push({
        optionCategoryId: item.optionCategoryId,
        quantity: item.quantity,
        coupon: 0,
        shippingFee: usedProductNos.has(item.productNo) ? 0 : item.productShippingFee || 0,
        basketNo: item.basketNo
      });
      usedProductNos.add(item.productNo);
    });

    axios.post(`${serverIP.ip}/order/setOrder`, {
      options: orderDetails,
      addrId: selAddrId,
      req: request,
      orderId: orderId,
      shippingFee: totalShippingFee,
      couponDiscount: selectedCoupon || 0,
      productIds: productIds
    }, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => {
          const basketNos = orderDetails.map(item => item.basketNo).join(',');
          const successUrl = `${serverIP.front}/payment/success?iid=${res.data.id}&basketNos=${basketNos}&couponId=${selectedCouponId}`;
          tossPayments
            .requestPayment("카드", {
              amount: parseInt(totalPaymentAmount),
              orderId,
              orderName,
              customerName: user.user.username,
              successUrl,
              failUrl: `${window.location.origin}/payment/fail`,
            })
            .catch(error => {
              console.error("결제 실패:", error);
              axios.get(`${serverIP.ip}/order/cancel?orderGroupId=${res.data.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
              }).catch(cancelErr => console.error("결제 취소 실패:", cancelErr));
              alert(`결제 실패: ${error.message}`);
            });
      })
      .catch(err => {
        console.error("주문 생성 실패:", err);
        alert("주문 생성에 실패했습니다.");
      });
  };

  const formatNumberWithCommas = (num) => {
    return (num === undefined || num === null) ? '0' : num.toLocaleString();
  };

  return (
    <div style={{ paddingTop: '150px' }}>
      <div className="product-buy-container">
        <h2 className="product-buy-header">상품 결제</h2>
        {isAuction && 
          <div className="product-buy-info">
            <div className="order-item">
              <h3>{location.state.product.productName}</h3>
              <p style={{fontSize:'20px'}}>가격: <strong>{formatNumberWithCommas(location.state.totalPrice)}</strong> 원</p>
              <p>배송비: <strong style={{ color: '#1976d2' }}>+{formatNumberWithCommas(location.state.shippingFee)}</strong>원</p>
              { location.state.selectedCoupon!==0 && <p>보증금: <strong style={{color:'#e74c3c'}}>-{formatNumberWithCommas(location.state.selectedCoupon)}</strong>원</p>}
              <span className="final-price" style={{borderTop:'1px solid #ddd'}}>
                  합계: <strong style={{ fontWeight: 'bold', fontSize: '20px' }}>{formatNumberWithCommas(totalPaymentAmount)}</strong> 원
                </span>
            </div>
          </div>}
        {orderItems.length > 0 && (
          <div className="product-buy-info">
            {Object.values(groupedItems).map((group, index) => (
              <div key={index} className="order-item">
                <h3 className="product-buy-name">{group.productName}</h3>
                <p style={{ fontSize: '20px' }}>가격: <strong style={{ textDecoration: 'line-through' }}>{formatNumberWithCommas(group.productPrice)}</strong> 원</p>
                <p className="buy-price">할인: <span style={{ color: '#d9534f', fontWeight: 'bold', fontSize: '19px' }}>{group.productDiscountRate}%</span></p>
                {group.productDiscountRate !== 0 && <p style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>할인가: <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatNumberWithCommas(group.productPrice * ((100 - group.productDiscountRate) / 100))}</span> 원</p>}
                {group.options.map((opt, idx) => (
                  <div key={idx} className="option-detail" style={{ marginLeft: '10px', padding: '5px 0' }}>
                    <p><span style={{ fontWeight: 'bold' }}>옵션</span>: {opt.categoryName} x {opt.quantity} (+{formatNumberWithCommas(opt.additionalPrice)} 원) = <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a7b63' }}>{formatNumberWithCommas((group.productPrice * ((100 - group.productDiscountRate) / 100) + opt.additionalPrice) * opt.quantity)}</span> 원</p>
                  </div>
                ))}

                <p>배송비: <strong style={{ color: '#1976d2' }}>{formatNumberWithCommas(group.productShippingFee)}</strong>원</p>
                <span>
                  합계: <strong style={{ fontWeight: 'bold', fontSize: '20px' }}>{formatNumberWithCommas(
                    group.options.reduce((sum, opt) => {
                      const discountedPrice = group.productPrice * (1 - group.productDiscountRate / 100);
                      return sum + (discountedPrice + opt.additionalPrice) * opt.quantity;
                    }, 0) + group.productShippingFee
                  )}</strong> 원
                </span>
              </div>
            ))}

            <div className="shipping-discount-info">
            <strong>쿠폰 선택:</strong> <select style={{marginBottom:'20px'}} className='product-info-selectbox' onChange={handleCouponChange} value={`${selectedCoupon}-${selectedCouponId}`}>
                <option value="0-0">쿠폰을 선택해주세요</option>
                {
                  couponList.map(item => {
                    return(<option key={item.id} value={`${item.discount}-${item.id}`}>
                      {item.couponName} : {item.discount}원
                    </option>);
                  })
                }
            </select>
              {totalShippingFee > 0 && <p className="shipping-fee">총 배송비: +{formatNumberWithCommas(totalShippingFee)}원</p>}
              {selectedCoupon > 0 && <p style={{ color: '#d9534f' }} className="discount-amount">쿠폰 할인: -{formatNumberWithCommas(selectedCoupon)}원</p>}
              {totalDiscountAmount > 0 && <p className="discount-amount" style={{ color: '#d9534f' }}>총 할인 금액: -{formatNumberWithCommas(totalDiscountAmount)}원</p>}
            </div>
            <div className="final-price">
              <strong>총 결제 금액: {formatNumberWithCommas(totalPaymentAmount)}원</strong>
            </div>
            <div className="payment-method">
              <strong>결제 수단 선택: </strong>
              <select className="payment-select">
                <option value="card">카드 결제</option>
                {/* 다른 결제 수단 추가 가능 */}
              </select>
            </div>
          </div>
        )}
        <div className='product-buy-info'>
          <AddressForm setSelAddrId={setSelAddrId} isGet={isGet} onAddAddress={handleAddAddress} setRequest={setRequest} request={request} setSelectedAddresses={setSelectedAddress} />
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