import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setModal } from "../../../../src/store/modalSlice";
import { setInteract } from "../../../../src/store/interactSlice";

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
    const [basketNo, setBasketNo] = useState();
    const dispatch = useDispatch();

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
            //console.log("아이템!!", item);
            const sellerNo = item.sellerNo;
            const sellerName = item.sellerName;
            const productName = item.productName;
            const productShippingFee = item.productShippingFee;
            const additionalPrice = item.additionalPrice;
            const productPrice = item.productPrice;
            const categoryName = item.categoryName;
            const productImage = item.productImage;
            const productDiscountRate = item.productDiscountRate;

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

    const handleSellerCheck = (sellerNo, checked) => {
        const newCheckedItems = { ...checkedItems };
        groupedItems[sellerNo].items.forEach(item => {
            if (checked) {
                newCheckedItems[item.basketNo] = true;
            } else {
                delete newCheckedItems[item.basketNo];
            }
        });
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

                totalDiscountedPrice += discountedPrice;

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
            return `${sellersArray[0]}님 주문하기`;
        } else {
            return `${sellersArray[0]}님 외 ${sellersArray.length - 1}건 주문하기`;
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

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="basket-addr">
                <span style={{ paddingLeft: "0px", fontSize: "17px", fontWeight: "600", color: "#555" }}>
                    {" "}
                    🏡 배송지 : {address}, {addressDetail}, {zipcode}
                    <button style={{ marginLeft: "30px" }} onClick={() => { dispatch(setModal({ isOpen: true, selected: 'address-box' })) }}>변경</button>
                </span>
                <hr />
            </div>

            <div className="basket-sel-all">
                <input type="checkbox" checked={allChecked} onChange={handleAllCheck} /> 전체 선택 {" "}
                <button type="button" onClick={handleDeleteSelected}>선택삭제</button>
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
                        /> <b>{groupedItems[seller].sellerName}</b>  님의 상품 <button type="button">쿠폰받기</button>
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
                                        <span>{formatNumber(item.productPrice)}원</span>
                                        <span>할인율:{item.productDiscountRate}%</span>

                                    </div>
                                </li>
                                <button style={{ marginLeft: "10px", width: '100px' }} onClick={() => { dispatch(setModal({ isOpen: true, selected: 'basket-box', selectedItem: item })) }}>주문수정</button>
                                <li>{item.categoryName}<br /> +{formatNumber(item.additionalPrice)}원</li>
                                <li>{item.quantity}</li>
                                <li>{formatNumber(item.productShippingFee)}원</li>
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
                    <li>{formatNumber(totals.selectedPrice)}원 ➕</li>
                    <li>{formatNumber(totals.totalShippingFee)}원 ➖</li>
                    <li>{formatNumber(totals.totalDiscountedPrice)}원 🟰</li>
                    <li>{formatNumber(totals.totalAmount)}원</li>
                    <li><button type="button">{getOrderButtonText()}</button></li>
                </ul>
            </div>
        </div>
    );
}
export default MyBasket;