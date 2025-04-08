import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import axios from "axios";

function ProductInfo() {
    const serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isWish, setIsWish] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [subOptions, setSubOptions] = useState([]);
    const [selectedSubOption, setSelectedSubOption] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState(0);

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
        if (selectedSubOption) {
            const discountPrice = loc.state.product.discountRate === 0
                ? loc.state.product.price
                : loc.state.product.price * (100 - loc.state.product.discountRate) / 100;
            const subOptionPrice = selectedSubOption ? selectedSubOption.additionalPrice : 0;
            let newTotalPrice = (discountPrice + subOptionPrice) * quantity;
            
            newTotalPrice -= selectedCoupon;

            newTotalPrice = newTotalPrice < 0 ? 0 : newTotalPrice;

            setTotalPrice(newTotalPrice);
        }
    }, [quantity, selectedSubOption, selectedCoupon]);

    const moveBuy = () => {
        navigate('/product/buying', {
            state: {
                productId: loc.state.product.id,
                price: totalPrice,
                productName: loc.state.product.productName
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
        const selected = e.target.value;
        const option = options.find(option => option.id == selected);
        setSelectedOption(option);
        setSubOptions(option ? option.subOptionCategories : []);
        setSelectedSubOption(null);
        setQuantity(1);
    };

    const handleSubOptionChange = (e) => {
        const selectedSub = e.target.value;
        const subOption = subOptions.find(option => option.id == selectedSub);
        setSelectedSubOption(subOption);
        setQuantity(1);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleCouponChange = (e) => {
        setSelectedCoupon(Number(e.target.value));
    };

    return (
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
                        <li style={{ height: '350px', border: '1px solid gray', marginTop: '10px' }}>
                            <ul className='product-info-main-box'>
                                {loc.state.product.discountRate !== 0 && (
                                    <li>
                                        <span style={{fontSize:'20px', fontWeight:'bold'}}>{loc.state.product.discountRate}%</span> 
                                        <span style={{ textDecoration: 'line-through', marginLeft:'15px', color:'gray' }}>
                                        &nbsp;{formatNumberWithCommas(loc.state.product.price)}&nbsp;
                                        </span>
                                    </li>
                                )}
                                <li>{loc.state.product.discountRate === 0 ? loc.state.product.price : formatNumberWithCommas(loc.state.product.price * (100 - loc.state.product.discountRate) / 100)}</li>
                                <li>
                                    <select onChange={handleCouponChange} value={selectedCoupon}>
                                        <option value="0" disabled>쿠폰을 선택해주세요</option>
                                        <option value="1000">1000원 쿠폰</option>
                                        <option value="3000">3000원 쿠폰</option>
                                    </select>
                                </li>
                                <li>쿠폰 적용박스</li>
                                <li>
                                    <select onChange={handleOptionChange}>
                                        <option value="" disabled selected>대분류를 선택해주세요</option>
                                        {options.map((option) => (
                                            <option key={option.id} value={option.id}>{option.optionName}</option>
                                        ))}
                                    </select>
                                </li>
                                {subOptions.length > 0 && (
                                    <li>
                                        <select onChange={handleSubOptionChange}>
                                            <option value="" disabled selected>소분류를 선택해주세요</option>
                                            {subOptions.map((subOption) => (
                                                <option key={subOption.id} value={subOption.id}>
                                                    {subOption.categoryName} (+{subOption.additionalPrice}원)
                                                </option>
                                            ))}
                                        </select>
                                    </li>
                                )}
                                {selectedSubOption && (
                                    <li>
                                        <select onChange={handleQuantityChange}>
                                            {[...Array(selectedSubOption.quantity).keys()].map((num) => (
                                                <option key={num} value={num + 1}>{num + 1}</option>
                                            ))}
                                        </select>
                                    </li>
                                )}
                            </ul>
                        </li>
                        <li>
                            <div className='total-price'>
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
        </div>
    );
}

export default ProductInfo;
