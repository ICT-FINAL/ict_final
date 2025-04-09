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
                    console.log("장바구니리스트:", res);
                    setBasketItems(res);
                })
                .catch((err) => console.log(err));
        }
    }, [user, serverIP]);

    const moveProductInfo = (item) => {
        console.log(item);
        navigate('/product/info', {
            state: {
                product: item.productNo
            }
        });
    }

    //     const groupedItems = useMemo(() => {
    //         const grouped = {};
    //         //basketItems.forEach((item) => {
    //         //const sellerId = item.productNo.sellerNo.id;

    //         // if (!grouped[sellerId]) {
    //         //     grouped[sellerId] = {
    //         //         //sellerInfo: item.productNo.sellerNo,
    //         //         items: []
    //         //     };
    //         // }
    //         // grouped[sellerId].items.push(item);
    //     });
    //     console.log("groupedItems:", grouped);
    //     return grouped;
    // }, [basketItems]);

    const handleAllCheck = (e) => {
        const newAllChecked = e.target.checked;
        setAllChecked(newAllChecked);

        const newCheckedItems = {};
        if (newAllChecked) {
            basketItems.forEach((item) => {
                newCheckedItems[item.id] = true;
            });
        }
        setCheckedItems(newCheckedItems);
    };

    const handleSellerCheck = (sellerId, checked) => {
        const newCheckedItems = { ...checkedItems };
        // groupedItems[sellerId].items.forEach(item => {
        //     if (checked) {
        //         newCheckedItems[item.id] = true;
        //     } else {
        //         delete newCheckedItems[item.id];
        //     }
        // });
        setCheckedItems(newCheckedItems);
    };

    const handleItemCheck = (basketId) => {
        const newCheckedItems = { ...checkedItems };
        if (newCheckedItems[basketId]) {
            delete newCheckedItems[basketId];
        } else {
            newCheckedItems[basketId] = true;
        }
        setCheckedItems(newCheckedItems);
    };

    useEffect(() => {
        setAllChecked(basketItems.length > 0 && basketItems.every((item) => checkedItems[item.id]));
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

        // basketItems.forEach((item) => {
        //     if (checkedItems[item.id]) {
        //         const discountPrice = item.productNo.discountRate > 0
        //             ? item.productNo.price * (100 - item.productNo.discountRate) / 100
        //             : item.productNo.price;
        //         const itemPrice = discountPrice + (item.option_no ? item.option_no.additionalPrice : 0);
        //         totalPrice += itemPrice * item.basketQuantity;
        //         totalShippingFee += item.productNo.shippingFee;
        //         totalQuantity += item.basketQuantity;
        //         //sellers.add(item.productNo.sellerNo.username);
        //     }
        // });

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

    const handleDeleteSelected = () => {
        if (window.confirm("선택한 상품을 삭제하시겠습니까?")) {
            const selectedBasketNos = Object.keys(checkedItems);
            if (selectedBasketNos.length === 0) {
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
                <input type="checkbox" checked={allChecked} onChange={handleAllCheck} /> 전체 선택
                <button type="button" onClick={handleDeleteSelected}>선택삭제</button>
                <hr />
            </div>


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