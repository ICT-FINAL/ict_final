import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function MyBasket() {
    const user = useSelector((state) => state.auth.user);
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [basketItems, setBasketItems] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (user) {
            axios
                .get(`${serverIP.ip}/auth/me`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    console.log("유저정보:", res.data);
                    setAddress(res.data.address);
                    setAddressDetail(res.data.addressDetail);
                    setZipcode(res.data.zipcode);
                })
                .catch((err) => console.log(err));

            axios
                .get(`${serverIP.ip}/basket/list`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    console.log("장바구니리스트:", res.data);
                    setBasketItems(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [user, serverIP]);

    const moveBuy = (item) => {
        console.log(item);
        navigate('/product/info', {
            state: {
                product: item
            }
        });
    }

    const groupedItems = useMemo(() => {
        const grouped = {};
        basketItems.forEach((item) => {
            const seller = item.sellerNo.sellerNo.username;
            if (!grouped[seller]) {
                grouped[seller] = [];
            }
            grouped[seller].push(item);
        });
        console.log(grouped);
        return grouped;
    }, [basketItems]);

    const handleAllCheck = (e) => {
        const newAllChecked = e.target.checked;
        setAllChecked(newAllChecked);

        const newCheckedItems = {};
        if (newAllChecked) {
            basketItems.forEach((item) => {
                newCheckedItems[item.basketNo] = true;
            });
        }
        setCheckedItems(newCheckedItems);
    };

    const handleItemCheck = (basketNo) => {
        const newCheckedItems = { ...checkedItems };
        if (newCheckedItems[basketNo]) {
            delete newCheckedItems[basketNo];
        } else {
            newCheckedItems[basketNo] = true;
        }
        setCheckedItems(newCheckedItems);
    };

    useEffect(() => {
        setAllChecked(basketItems.length > 0 && basketItems.every((item) => checkedItems[item.basketNo]));
    }, [checkedItems, basketItems]);

    const formatNumber = (number) => {
        if (number === undefined || number === null) {
            return "0";
        }
        return number.toLocaleString();
    };

    const calculateTotals = () => {
        let totalPrice = 0;
        let totalShippingFee = 0;
        let totalQuantity = 0;
        let sellers = new Set();

        basketItems.forEach((item) => {
            if (checkedItems[item.basketNo]) {
                totalPrice += item.sellerNo.price * item.quantity;
                totalShippingFee += item.sellerNo.shippingfee;
                totalQuantity += item.quantity;
                sellers.add(item.sellerNo.sellerNo.username);
            }
        });

        return { totalPrice, totalShippingFee, totalQuantity, totalAmount: totalPrice + totalShippingFee, sellers };
    };

    const totals = calculateTotals();

    const getOrderButtonText = () => {
        const sellersArray = Array.from(totals.sellers);
        if (sellersArray.length === 0) {
            return "주문하기";
        } else if (sellersArray.length === 1) {
            return `${sellersArray[0]}님 주문하기`;
        } else {
            return `${sellersArray[0]}님 외 ${sellersArray.length - 1}건 주문하기`;
        }
    };

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="basket-addr">
                <span style={{ paddingLeft: "0px", fontSize: "17px", fontWeight: "600", color: "#555" }}>
                    {" "}
                    🏡 배송지 : {address}, {addressDetail}, {zipcode}
                    <button style={{ marginLeft: "30px" }}>변경</button>
                </span>
                <hr />
            </div>

            <div className="basket-sel-all">
                <input type="checkbox" checked={allChecked} onChange={handleAllCheck} /> 전체 선택 <button type="button">선택삭제</button>
                <hr />
            </div>
            {Object.keys(groupedItems).length > 0 ? (
                Object.keys(groupedItems).map((seller, index) => (
                    <div key={index} className="basket-body">
                        <input type="checkbox" checked={groupedItems[seller].every(item => checkedItems[item.basketNo])} onChange={(e) => {
                            if (e.target.checked) {
                                const newChecked = { ...checkedItems };
                                groupedItems[seller].forEach(item => {
                                    newChecked[item.basketNo] = true;
                                });
                                setCheckedItems(newChecked);
                            } else {
                                const newChecked = { ...checkedItems };
                                groupedItems[seller].forEach(item => {
                                    delete newChecked[item.basketNo];
                                });
                                setCheckedItems(newChecked);
                            }
                        }} /> {seller} 님의 상품 <button type="button">쿠폰받기</button>
                        <ul className="basket-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                            <li></li>
                            <li>판매자</li>
                            <li>제품</li>
                            <li>가격</li>
                            <li>수량</li>
                            <li>배송비</li>
                        </ul>
                        {groupedItems[seller].map((item, idx) => (
                            <ul key={idx} className="basket-list">
                                <li><input type="checkbox" checked={checkedItems[item.basketNo] || false} onChange={() => handleItemCheck(item.basketNo)} /></li>
                                <li>{seller}</li>
                                <li style={{ cursor: "pointer" }} onClick={() => moveBuy(item.sellerNo)}>
                                    <img style={{ width: '5vw', height: '5vw', borderRadius: '10px' }}
                                        src={`${serverIP.ip}/uploads/product/${item.sellerNo.id}/${item.sellerNo.images[0].filename}`}
                                        onClick={() => setImageIndex(idx)}
                                    />
                                    {item.sellerNo.productName}
                                </li>
                                <li>{formatNumber(item.sellerNo.price)}원</li>
                                <li>{item.quantity}</li>
                                <li>{formatNumber(item.sellerNo.shippingfee)}원</li>
                            </ul>
                        ))}
                    </div>
                ))
            ) : (
                <div style={{ marginTop: "10px" }}>장바구니에 담긴 상품이 없습니다.</div>
            )}
            <div className="basket-body" style={{ backgroundColor: "beige", borderRadius: "10px" }}>
                <ul className="price-list">
                    <li>선택상품금액</li>
                    <li>총배송비</li>
                    <li>할인예상금액</li>
                    <li>주문금액</li>
                    <li></li>
                </ul>
                <ul className="price-list">
                    <li>{formatNumber(totals.totalPrice)}원{" "}➕</li>
                    <li>{formatNumber(totals.totalShippingFee)}원{" "}➖</li>
                    <li>0원{" "}🟰</li>
                    <li>{formatNumber(totals.totalAmount)}원</li>
                    <li><button type="button">{getOrderButtonText()}</button></li>
                </ul>
            </div>
        </div>
    );
}
export default MyBasket;