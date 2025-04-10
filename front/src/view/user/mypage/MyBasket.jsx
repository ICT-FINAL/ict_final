import axios from "axios";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setModal } from "../../../../src/store/modalSlice";

function MyBasket() {
    const user = useSelector((state) => state.auth.user);
    const modalSel = useSelector((state) => state.modal);
    const [basketItems, setBasketItems] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);
    const dispatch = useDispatch();

    const fetchBasketItems = useCallback(async () => {
        if (user) {
            try {
                const response = await axios.get(`${serverIP.ip}/basket/list`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                console.log("장바구니리스트:", response.data);
                setBasketItems(response.data);
            } catch (err) {
                console.log(err);
            }
        }
    }, [user, serverIP]);

    useEffect(() => {
        if (user) {
            axios
                .get(`${serverIP.ip}/auth/me`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    console.log("유저정보:", res.data);
                })
                .catch((err) => console.log(err));

            fetchBasketItems();
        }
    }, [user, serverIP, fetchBasketItems]);

    useEffect(() => {
        if (!modalSel.isOpen && modalSel.selected === 'basket-box') {
            fetchBasketItems();
        }
    }, [modalSel, fetchBasketItems]);

    const moveProductInfo = (item) => {
        if (user) {
            axios.get(`${serverIP.ip}/basket/getProduct?productId=${item}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            })
                .then(res => {
                    navigate('/product/info', {
                        state: {
                            product: res.data
                        }
                    });
                })
                .catch(err => console.log(err));
        }
    }

    const groupedItems = useMemo(() => {
        const grouped = {};
        basketItems.forEach((item) => {
            const sellerNo = item.sellerNo;
            const sellerName = item.sellerName;
            const productName = item.productName;
            const productShippingFee = item.productShippingFee;
            const additionalPrice = item.additionalPrice;
            const productPrice = item.productPrice;
            const productImage = item.productImage;
            const productDiscountRate = item.productDiscountRate;
            const optionName = item.optionName;

            if (!grouped[sellerNo]) {
                grouped[sellerNo] = {
                    sellerName: sellerName,
                    productName: productName,
                    productImage: productImage,
                    productPrice: productPrice,
                    productDiscountRate: productDiscountRate,
                    additionalPrice: additionalPrice,
                    items: []
                };
            }
            grouped[sellerNo].items.push(item);
            console.log("아이템 정보 봐보자!!", item);
        });
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

    const formatNumberWithCommas = (number) => {
        if (number === undefined || number === null) {
            return "0";
        }
        return number.toLocaleString();
    };

    const calculateTotals = () => {
        let selectedPrice = 0;
        let totalDiscountedPrice = 0;
        let totalShippingFee = 0;
        let totalQuantity = 0;
        let discountedPrice = 0;
        let sellers = new Set();

        basketItems.forEach((item) => {
            if (checkedItems[item.basketNo]) {
                const discountedPrice = item.productDiscountRate > 0
                    ? item.productPrice * item.productDiscountRate / 100
                    : item.productPrice;

                const itemPrice = item.productPrice;

                selectedPrice += (itemPrice + item.additionalPrice) * item.quantity;
                totalDiscountedPrice += discountedPrice * item.quantity;
                totalShippingFee += item.productShippingFee;
                sellers.add(item.sellerName);
            }
        });

        return { selectedPrice, totalDiscountedPrice, totalShippingFee, totalQuantity, totalAmount: selectedPrice + totalShippingFee - totalDiscountedPrice, sellers };
    };

    const totals = calculateTotals();

    const getOrderButtonText = () => {
        const sellersArray = Array.from(totals.sellers);
        if (sellersArray.length === 0) {
            return "주문하기";
        } else if (sellersArray.length === 1) {
            return `${sellersArray[0]}님의 상품 주문하기`;
        } else {
            return `${sellersArray[0]}님의 상품 외 ${sellersArray.length - 1}건 주문하기`;
        }
    };

    const handleDeleteSelected = () => {
        if (window.confirm("선택한 상품을 삭제하시겠습니까?")) {
            const selectedBasketNos = Object.keys(checkedItems);
            if (selectedBasketNos.length === 0) {
                alert("선택한 상품이 없습니다.");
                return;
            }

            axios
                .delete(`${serverIP.ip}/basket/delete`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                    data: { basketNos: selectedBasketNos },
                })
                .then(() => {
                    setBasketItems(basketItems.filter((item) => !selectedBasketNos.includes(String(item.basketNo))));
                    setCheckedItems({});
                    setAllChecked(false);
                })
                .catch((err) => console.log(err));
        }
        alert("선택한 장바구니 상품이 삭제되었습니다.");
    };

    const handleOrder = () => {
        const selectedItemsForOrder = basketItems.filter(item => checkedItems[item.basketNo]);

        if (selectedItemsForOrder.length === 0) {
            alert("선택된 상품이 없습니다.");
            return;
        }

        navigate('/product/buying', { state: { basketItems: selectedItemsForOrder } });
    };

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="basket-sel-all">
                <input type="checkbox" checked={allChecked} onChange={handleAllCheck} /> 전체 선택 {" "}
                <button type="button" onClick={handleDeleteSelected}>선택 삭제</button>
                <hr />
            </div>
            {Object.keys(groupedItems).length > 0 ? (
                Object.keys(groupedItems).map((seller, index) => (
                    <div key={index} className="basket-body">
                        <input
                            type="checkbox"
                            checked={groupedItems[seller].items.every(item => checkedItems[item.basketNo])}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    const newChecked = { ...checkedItems };
                                    groupedItems[seller].items.forEach(item => {
                                        newChecked[item.basketNo] = true;
                                    });
                                    setCheckedItems(newChecked);
                                } else {
                                    const newChecked = { ...checkedItems };
                                    groupedItems[seller].items.forEach(item => {
                                        delete newChecked[item.basketNo];
                                    });
                                    setCheckedItems(newChecked);
                                }
                            }}
                        /> <b>{groupedItems[seller].sellerName}</b>님의 상품 <button type="button">쿠폰 받기</button>
                        <ul className="basket-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                            <li></li>
                            <li>제품</li>
                            <li></li>
                            <li>가격</li>
                            <li>수량</li>
                            <li>배송비</li>
                        </ul>
                        {groupedItems[seller].items.map((item, idx) => (
                            <ul key={idx} className="basket-list">
                                <li><input type="checkbox" checked={checkedItems[item.basketNo] || false} onChange={() => handleItemCheck(item.basketNo)} /></li>
                                <li style={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => moveProductInfo(item.productNo)}>
                                    <img style={{ width: '10vw', height: '10vw', borderRadius: '10px', marginRight: '10px' }}
                                        src={`${serverIP.ip}/uploads/product/${item.sellerNo}/${item.productImage}`}
                                        onError={(e) => { e.target.src = 'default.jpg'; }}
                                        onClick={() => setImageIndex(idx)}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span>판매자:{item.sellerName}</span>
                                        <span>{item.productName}</span>
                                        <span>{formatNumberWithCommas(item.productPrice)}원</span>
                                        <span>할인율:{item.productDiscountRate}%</span>
                                    </div>
                                </li>
                                <button style={{ marginLeft: "10px", width: '100px' }} onClick={() => { dispatch(setModal({ isOpen: true, selected: 'basket-box', selectedItem: item })) }}>주문수정</button>
                                <li>옵션: <br />{item.optionName} {item.categoryName}<br /> +{formatNumberWithCommas(item.additionalPrice)}원</li>
                                <li>{item.quantity}</li>
                                <li>{formatNumberWithCommas(item.productShippingFee)}원</li>
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
                    <li>{formatNumberWithCommas(totals.selectedPrice)}원 ➕</li>
                    <li>{formatNumberWithCommas(totals.totalShippingFee)}원 ➖</li>
                    <li>{formatNumberWithCommas(totals.totalDiscountedPrice)}원 🟰</li>
                    <li>{formatNumberWithCommas(totals.totalAmount)}원</li>
                    <li><button type="button" style={{ width: '100px' }} onClick={handleOrder}>{getOrderButtonText()}</button></li>
                </ul>
            </div>
        </div>
    );
}
export default MyBasket;