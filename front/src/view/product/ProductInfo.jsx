import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaHeart, FaShoppingCart, FaTimes } from "react-icons/fa";
import axios from "axios";

function ProductInfo() {
    const serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isWish, setIsWish] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedOptionId, setSelectedOptionId] = useState("");
    const [selectedSubOptionId, setSelectedSubOptionId] = useState("");
    const [subOptions, setSubOptions] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedCoupon, setSelectedCoupon] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const [changeMenu, setChangeMenu] = useState('detail');

    useEffect(() => {
        axios.get(`${serverIP.ip}/product/getOption?id=${loc.state.product.id}`,{
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            setOptions(res.data);
        })
        .catch(err => console.log(err));
        getWish();
    },[]);

    useEffect(() => {
        let newTotalPrice = 0;
        selectedItems.forEach(item => {
            const discountPrice = loc.state.product.discountRate === 0
                ? loc.state.product.price
                : loc.state.product.price * (100 - loc.state.product.discountRate) / 100;
            const itemPrice = discountPrice + (item.subOption ? item.subOption.additionalPrice : 0);
            newTotalPrice += itemPrice * item.quantity;
        });

        newTotalPrice -= selectedCoupon;
        newTotalPrice += loc.state.product.shippingFee;
        newTotalPrice = newTotalPrice < 0 ? 0 : newTotalPrice;
        setTotalPrice(newTotalPrice);
    }, [selectedItems, selectedCoupon, loc.state.product.price, loc.state.product.discountRate]);

    const moveBuy = () => {
        if(totalPrice === 0) alert('구매하실 상품을 선택해주세요');
        else
            navigate('/product/buying', {
                state: {
                    productId: loc.state.product.id,
                    totalPrice: totalPrice,
                    productName: loc.state.product.productName,
                    selectedOptions: selectedItems,
                    shippingFee:loc.state.product.shippingFee || 0,
                    selectedCoupon:selectedCoupon || 0
                }
            });
    };

    const getWish = () => {
        axios.get(`${serverIP.ip}/interact/getWish?userId=${user.user.id}&productId=${loc.state.product.id}`,{
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            if(res.data === undefined || res.data === '') {
                setIsWish(false);
            } else {
                setIsWish(true);
            }
        })
        .catch(err => console.log(err));
    };

    const addWish = () => {
        axios.get(`${serverIP.ip}/interact/addWish?userId=${user.user.id}&productId=${loc.state.product.id}`,{
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => setIsWish(true))
        .catch(err => console.log(err));
    };

    const delWish = () => {
        axios.get(`${serverIP.ip}/interact/delWish?userId=${user.user.id}&productId=${loc.state.product.id}`,{
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => setIsWish(false))
        .catch(err => console.log(err));
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const handleOptionChange = (e) => {
        const selectedId = e.target.value;
        setSelectedOptionId(selectedId);
        const option = options.find(option => option.id == selectedId);
        setSubOptions(option ? option.subOptionCategories : []);
        setSelectedSubOptionId("");
        setQuantity(1);
    };

    const handleSubOptionChange = (e) => {
        setSelectedSubOptionId(e.target.value);
        setQuantity(1);
    };

    const handleCouponChange = (e) => {
        setSelectedCoupon(Number(e.target.value));
    };

    const handleAddItem = () => {
        if (!selectedOptionId) {
            alert("대분류를 선택해주세요.");
            return;
        }
        const selectedOption = options.find(opt => opt.id == selectedOptionId);
        let selectedSubOption = null;
        if (selectedSubOptionId) {
            selectedSubOption = subOptions.find(subOpt => subOpt.id == selectedSubOptionId);
        }

        if (selectedSubOption && Number(quantity) > selectedSubOption.quantity) {
            alert(`선택한 소분류의 재고가 부족합니다. (현재 재고: ${selectedSubOption.quantity})`);
            return;
        }

        const existingItemIndex = selectedItems.findIndex(item => {
            const subOptionMatch = (selectedSubOptionId === "" && item.subOption === null) ||
                                   (item.subOption && String(item.subOption.id) === String(selectedSubOptionId));
            return String(item.option.id) === String(selectedOptionId) && subOptionMatch;
        });

        if (existingItemIndex > -1) {
            //동일 옵션 있으면 수량 +
            const existingItem = selectedItems[existingItemIndex];
            const newQuantity = Number(existingItem.quantity) + Number(quantity);

            if (selectedSubOption && newQuantity > selectedSubOption.quantity) {
                alert(`선택한 소분류의 최대 수량을 초과할 수 없습니다. (최대 재고: ${selectedSubOption.quantity})`);
                return;
            }

            const updatedItems = selectedItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            setSelectedItems(updatedItems);
        } else {
            const newItem = {   //동일 옵션 아닐때때
                option: selectedOption,
                subOption: selectedSubOption,
                quantity: Number(quantity)
            };
            setSelectedItems([...selectedItems, newItem]);
        }

        setSelectedOptionId("");
        setSelectedSubOptionId("");
        setSubOptions([]);
        setQuantity(1);
    };

    const removeItem = (index) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);
        setSelectedItems(newItems);
    };

    const handleItemQuantityChange = (index, newQuantity) => {
        const updatedItems = selectedItems.map((item, i) => {
            if (i === index) {
                return { ...item, quantity: Number(newQuantity) };
            }
            return item;
        });
        setSelectedItems(updatedItems);
    };

    return (
        <>
        <div style={{ paddingTop: "140px" }}>
            <div className="product-info-container">
                <div className="product-info-left">
                    <img
                        id="product-big-img"
                        src={`${serverIP.ip}/uploads/product/${loc.state.product.id}/${loc.state.product.images[imageIndex].filename}`}
                        alt="상품 이미지"
                    />
                    <ul className="product-thumbnail-list">
                        {loc.state.product.images.map((img, idx) => (
                            <li key={idx} className={`thumbnail-item ${idx === imageIndex ? "active" : ""}`}>
                                <img
                                    src={`${serverIP.ip}/uploads/product/${loc.state.product.id}/${img.filename}`}
                                    alt={`Thumbnail ${idx}`}
                                    onClick={() => setImageIndex(idx)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="product-info-right">

                    <div style={{ 
                        marginTop: "5px", padding: "4px 8px", display: "inline-block",
                        borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                        backgroundColor: loc.state.product.shippingFee === 0 ? "#ff4d4d" : "#f2f2f2",
                        color: loc.state.product.shippingFee === 0 ? "white" : "black",
                        minHeight: "20px",
                        lineHeight: "20px" // 가운데 정렬
                    }}>
                        {loc.state.product.shippingFee === 0 ? "🚚 무료배송" : `배송비 ${loc.state.product.shippingFee}원`} {/* 배송비 */}
                    </div>

                    <ul>
                        <li style={{ display: 'flex' }}>
                            <div className='product-profile-box'>
                                <img id={`mgx-${loc.state.product.sellerNo.id}`} className='message-who' src={loc.state.product.sellerNo.uploadedProfileUrl && loc.state.product.sellerNo.uploadedProfileUrl.indexOf('http') !== -1 ? `${loc.state.product.sellerNo.uploadedProfileUrl}` : `${serverIP.ip}${loc.state.product.sellerNo.uploadedProfileUrl}`} alt='' width={40} height={40} style={{ borderRadius: '100%', backgroundColor: 'white', border: '1px solid gray' }} />
                                <div id={`mgx-${loc.state.product.sellerNo.id}`} className='message-who' style={{ height: '40px', lineHeight: '40px', marginLeft: '5px' }}>{loc.state.product.sellerNo.username} &gt;</div>
                            </div>
                            <div className='product-star-rating'>
                                ★★★★★ <span style={{ color: 'black' }}>{loc.state.product.rating}</span>
                            </div>
                        </li>
                        <li style={{ display: 'flex', marginTop: '20px', fontSize: '25px', lineHeight: '30px' }}>
                            <div className='product-info-name'>
                                {loc.state.product.productName}
                            </div>
                            <div className='product-wish'>
                                {!isWish ? (
                                    <div className="wishlist-icon" onClick={() => { addWish() }}>
                                        <FaHeart />
                                        <span>좋아요</span>
                                    </div>
                                ) : (
                                    <div className="wishlist-icon" onClick={() => { delWish() }} style={{ color: 'rgb(255, 70, 70)' }}>
                                        <FaHeart />
                                        <span>좋아요</span>
                                    </div>
                                )}
                                <div className="cart-icon">
                                    <FaShoppingCart />
                                    <span>장바구니</span>
                                </div>
                            </div>
                        </li>
                        <li>
                            <ul className='product-info-main-box'>
                                {loc.state.product.discountRate !== 0 && (
                                    <li>
                                        <span style={{fontSize:'20px', fontWeight:'bold'}}>{loc.state.product.discountRate}%</span>
                                        <span style={{ textDecoration: 'line-through', marginLeft:'15px', color:'gray' }}>
                                            &nbsp;{formatNumberWithCommas(loc.state.product.price)}&nbsp;
                                        </span>
                                    </li>
                                )}
                                <li><span style={{fontWeight:'bold', fontSize:'24px'}}>{loc.state.product.discountRate === 0 ? formatNumberWithCommas(loc.state.product.price) : formatNumberWithCommas(loc.state.product.price * (100 - loc.state.product.discountRate) / 100)}</span> 원</li>
                                <li>
                                    <select className='product-info-selectbox' onChange={handleCouponChange} value={selectedCoupon}>
                                        <option value="0">쿠폰을 선택해주세요</option>
                                        <option value="1000">1000원 쿠폰</option>
                                        <option value="3000">3000원 쿠폰</option>
                                    </select>
                                </li>
                                { (loc.state.product.discountRate !== 0 || selectedCoupon!==0) &&
                                <li className='info-coupon-box' style={{color:'#d34141', border:'1px solid #ddd', width:'76%', margin:'15px 0px 15px 20px', borderRadius:'10px'}}>
                                    { loc.state.product.discountRate !== 0 && <div>상품 할인가: -{formatNumberWithCommas(loc.state.product.discountRate * loc.state.product.price / 100)}원</div>}
                                    { loc.state.product.shippingFee !==0 && <div style={{color:'#0288D1'}}>배송비: +{formatNumberWithCommas(loc.state.product.shippingFee)}원</div>}
                                    { selectedCoupon!==0 && <div>쿠폰: -{selectedCoupon}원</div>}
                                </li>
                                }
                                <li>
                                    <select className='product-info-selectbox' onChange={handleOptionChange} value={selectedOptionId}>
                                        <option value="" disabled selected>대분류를 선택해주세요</option>
                                        {options.map((option) => (
                                            <option key={option.id} value={option.id}>{option.optionName}</option>
                                        ))}
                                    </select>
                                    {subOptions.length > 0 && (
                                        <>
                                            <select style={{marginLeft:'15px'}} className='product-info-selectbox' onChange={handleSubOptionChange} value={selectedSubOptionId}>
                                                <option value="" disabled selected>소분류를 선택해주세요</option>
                                                {subOptions.map((subOption) => (
                                                    <option key={subOption.id} value={subOption.id}>
                                                        {subOption.categoryName} (+{subOption.additionalPrice}원)
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedSubOptionId.length > 0 &&
                                            <button type="button" className="product-select-button" onClick={handleAddItem}>등록</button>
                                            }
                                        </>
                                    )}
                                </li>
                                {selectedItems.length > 0 && (
                                    <li style={{marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px'}}>
                                        <strong>선택된 옵션:</strong>
                                        <ul>
                                            {selectedItems.map((item, index) => {
                                                const basePrice = loc.state.product.discountRate === 0
                                                    ? loc.state.product.price
                                                    : loc.state.product.price * (100 - loc.state.product.discountRate) / 100;

                                                const subOptionPrice = item.subOption ? item.subOption.additionalPrice : 0;

                                                const itemPrice = (basePrice + subOptionPrice) * item.quantity;

                                                return (
                                                    <>
                                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>
                                                        <div>
                                                            {item.option.optionName}
                                                            {item.subOption && ` - ${item.subOption.categoryName} (+${formatNumberWithCommas(item.subOption.additionalPrice)}원)`}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <label htmlFor={`quantity-${index}`} style={{ marginRight: '5px' }}>수량:</label>
                                                            <select
                                                                id={`quantity-${index}`}
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                                                style={{ width: '60px', height: '25px' }}
                                                            >
                                                                {[...Array(item.subOption?.quantity || 10).keys()].map((num) => (
                                                                    <option key={num} value={num + 1}>{num + 1}</option>
                                                                ))}
                                                            </select>
                                                            <button type="button" onClick={() => removeItem(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '10px' }}>
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    </li>
                                                    <li style={{textAlign:'right', listStyleType:'none', fontSize:'17px'}}>
                                                        <div>{formatNumberWithCommas(itemPrice)}원</div>
                                                    </li>
                                                    </>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                )}
                            </ul>
                        </li>
                        <li>
                            <div style={{fontSize:'20px', padding:'15px'}} className='total-price'>
                                <strong>총 금액:</strong> {formatNumberWithCommas(totalPrice)}원
                            </div>
                        </li>
                        <li>
                            <button className='product-buy-button' onClick={() => moveBuy()}>
                                구매하기
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* 상세정보, 후기 메뉴 */}
            <div style={{ paddingTop: "10%", width: '80%', margin: '0 auto' }}>
                <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc' }} />
                <div style={{
                    display: 'flex',
                    gap: '50px',  // 요소 사이 간격 추가
                    padding: '10px 0',
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    <div style={{padding:'0 50px'}} onClick={()=>setChangeMenu("detail")}>상세정보</div>
                    <div style={{padding:'0 50px'}} onClick={()=>setChangeMenu("review")}>후기</div>
                </div>
                <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc' }} />
            </div>

            {/* 상세정보, 후기 메뉴 클릭시 */}
            <div>
                {changeMenu==="detail" &&
                <>
                    {
                        // productList.length === 0 &&
                        <div style={{padding: '20px', textAlign: 'center'}}>등록된 정보가 없습니다.</div>
                    }
                    상세정보 내용 
                </>
                }

                {changeMenu==="review" &&
                <>
                    {
                        // productList.length === 0 &&
                        <div style={{padding: '20px', textAlign: 'center'}}>등록된 정보가 없습니다.</div>
                    }
                    후기 내용 
                </>
                }
            </div>
        </div>
        </>
    );
}

export default ProductInfo;