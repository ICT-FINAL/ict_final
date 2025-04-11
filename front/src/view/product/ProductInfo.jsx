import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FaHeart, FaShoppingCart, FaTimes } from "react-icons/fa";
import axios from "axios";
import { Star } from "lucide-react";
import reviewWriteBtn from '../../img/review.png';

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
    const [addBasketItems, setAddBasketItems] = useState(null);
    const [changeMenu, setChangeMenu] = useState('detail');
    const [reviewWrite, setReviewWrite] = useState(false);

    const [isSubOptionRegistered, setIsSubOptionRegistered] = useState(false);

    useEffect(() => {
        axios.get(`${serverIP.ip}/product/getOption?id=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                setOptions(res.data);
            })
            .catch(err => console.log(err));
        getWish();
    }, []);

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
        if (!isSubOptionRegistered) alert('구매하실 상품을 선택해주세요');
        else
            navigate('/product/buying', {
                state: {
                    selectedItems: selectedItems,
                    product: loc.state.product,
                    totalPrice: totalPrice,
                    shippingFee: loc.state.product.shippingFee || 0,
                    selectedCoupon: selectedCoupon || 0,
                }
            });
    };

    const getWish = () => {
        axios.get(`${serverIP.ip}/interact/getWish?userId=${user.user.id}&productId=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                if (res.data === undefined || res.data === '') {
                    setIsWish(false);
                } else {
                    setIsWish(true);
                }
            })
            .catch(err => console.log(err));
    };

    const addWish = () => {
        axios.get(`${serverIP.ip}/interact/addWish?userId=${user.user.id}&productId=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => setIsWish(true))
            .catch(err => console.log(err));
    };

    const delWish = () => {
        axios.get(`${serverIP.ip}/interact/delWish?userId=${user.user.id}&productId=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => setIsWish(false))
            .catch(err => console.log(err));
    };

    const addBasket = () => {
        if (selectedItems.length === 0) {
            alert("장바구니에 담을 상품을 선택해주세요.");
            return;
        }

        const basketItems = selectedItems.map(item => ({
            optionId: item.option.id,
            subOptionId: item.subOption ? item.subOption.id : null,
            quantity: item.quantity
        }));

        console.log("장바구니 추가 요청 데이터:", {
            userId: user.user.id,
            productId: loc.state.product.id,
            items: basketItems
        });

        axios.post(`${serverIP.ip}/basket/add`, basketItems, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                console.log("장바구니 추가 성공:", res.data);
                setAddBasketItems(res.data);
                if ("success") {
                    alert("장바구니에 상품이 담겼습니다.");
                    navigate('/mypage/basket');
                } else {
                    alert("장바구니 담기에 실패했습니다.");
                }
            })
            .catch(err => {
                console.error("장바구니 추가 오류:", err);
                alert("장바구니 담기 중 오류가 발생했습니다.");
            });
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
            const newItem = {   //동일 옵션 아닐때
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
        setIsSubOptionRegistered(true);
    };

    const removeItem = (index) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);

        const updatedItems = selectedItems.filter((_, i) => i !== index);
        setSelectedItems(newItems);

        const hasRemainingSubOption = updatedItems.some(item => item.subOption !== null);
        if (!hasRemainingSubOption) {
            setIsSubOptionRegistered(false);
        }
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

    /*후기*/
    const [isPurchased, setIsPurchased] = useState(false); // 구매한 사람인지 여부 저장
    const [isReview, setIsReview] = useState(false); // 리뷰를 이미 작성한 사람인지 여부 저장 

    useEffect(() => {
        axios.get(`${serverIP.ip}/review/checkPurchase?userId=${user.user.id}&productId=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(function(response) {  
            //  console.log(response.data.purchased);
            //  console.log(response.data.review);
            if (response.data.purchased === true) {
                setIsPurchased(true);
            }
        })
        .catch(function(error) {
            console.log(error);
        });
    }, []);

    const [rate, setRate] = useState(0); // 별점 
    let [reviewContent, setReviewContent] = useState('');

    function handleData(event) {
        // if(event.target.name=='reviewContent') setReviewContent(event.target.value);
        if (event.target.value.length > 230) {
            alert("230글자까지 가능합니다.");
            return;
        }
        setReviewContent(event.target.value);
    }

    //후기 이미지 파일 
    const [reviewFiles, setReviewFiles] = useState([]);
    const fileInputRef = useRef(null);

    const changeFile = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (selectedFiles) => {
        const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length !== selectedFiles.length) {
            alert("이미지 파일만 업로드 가능합니다.");
        }
        if (reviewFiles.length + imageFiles.length > 5) {
            alert("이미지는 최대 5개까지만 등록할 수 있습니다.");
            return;
        }
        setReviewFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
        setReviewFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    function handleSubmit(event) {
        event.preventDefault();

        if (rate === 0) {
            alert("별점을 선택해주세요!");
            return;
        }

        if (reviewContent === '') {
            alert('후기를 입력해주세요.');
            return false;
        }

        //첨부파일이 있어 Form객체를 만들어 서버에 전송해야한다.
        let formData = new FormData();
        formData.append("productId", loc.state.product.id); // 어떤 상품인지
        formData.append("reviewContent", reviewContent); // 후기내용
        formData.append("rate", rate); // 평점
        for (let idx = 0; idx < reviewFiles.length; idx++) { // 첨부파일
            formData.append("files", reviewFiles[idx]);
        }

        axios.post(`${serverIP.ip}/review/write`, formData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    // 선택된 상품에 대한 후기 리스트 불러오기
    let [reviewList, setReviewList] = useState({});
    const [likedReviews, setLikedReviews] = useState(new Set());

    useEffect(() => {
        getReviewList();
    }, [serverIP, loc, user]);

    const getReviewList = () => {
        if(user)
            axios.get(`${serverIP.ip}/review/productReviewList?productId=${loc.state.product.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(response => {
                setReviewList(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }

    const handleLike = async (reviewId, userId,review) => {
        try {
            console.log(review.likes)
            for(let i=0;i<review.likes.length;i++) {
                if(review.likes[i].user.id == user.user.id) {
                    //여기서 좋아요 삭제
                    // review.likes[i].id --> 좋아요 아이디

                    return;
                }
            }
            // 좋아요 +1
            const response = await axios.post(`${serverIP.ip}/review/like`, null, {
                params: { reviewId, userId },
                headers: { Authorization: `Bearer ${user.token}` }
            });
    
            getReviewList();

            const { likes, liked } = response.data;
    
            // 상태 업데이트 (리뷰 리스트에서 해당 리뷰만 수정)
            const updatedReviewList = reviewList.map(review =>
                review.id === reviewId ? { ...review, likes, liked } : review
            );
    
            setReviewList(updatedReviewList);
        } catch (error) {
            console.error("좋아요 처리 중 오류 발생:", error);
        }
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
                            marginLeft: '50px',
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
                                    <div className="cart-icon" onClick={() => { addBasket() }}>
                                        <FaShoppingCart />
                                        <span>장바구니</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <ul className='product-info-main-box'>
                                    {loc.state.product.discountRate !== 0 && (
                                        <li>
                                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{loc.state.product.discountRate}%</span>
                                            <span style={{ textDecoration: 'line-through', marginLeft: '15px', color: 'gray' }}>
                                                &nbsp;{formatNumberWithCommas(loc.state.product.price)}&nbsp;
                                            </span>
                                        </li>
                                    )}
                                    <li><span style={{ fontWeight: 'bold', fontSize: '24px' }}>{loc.state.product.discountRate === 0 ? formatNumberWithCommas(loc.state.product.price) : formatNumberWithCommas(loc.state.product.price * (100 - loc.state.product.discountRate) / 100)}</span> 원</li>
                                    <li>
                                        <select className='product-info-selectbox' onChange={handleCouponChange} value={selectedCoupon}>
                                            <option value="0">쿠폰을 선택해주세요</option>
                                            <option value="1000">1000원 쿠폰</option>
                                            <option value="3000">3000원 쿠폰</option>
                                        </select>
                                    </li>
                                    {(loc.state.product.discountRate !== 0 || selectedCoupon !== 0) &&
                                        <li className='info-coupon-box' style={{ color: '#d34141', border: '1px solid #ddd', width: '76%', margin: '15px 0px 15px 20px', borderRadius: '10px' }}>
                                            {loc.state.product.discountRate !== 0 && <div>상품 할인가: -{formatNumberWithCommas(loc.state.product.discountRate * loc.state.product.price / 100)}원</div>}
                                            {loc.state.product.shippingFee !== 0 && <div style={{ color: '#0288D1' }}>배송비: +{formatNumberWithCommas(loc.state.product.shippingFee)}원</div>}
                                            {selectedCoupon !== 0 && <div>쿠폰: -{selectedCoupon}원</div>}
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
                                                <select style={{ marginLeft: '15px' }} className='product-info-selectbox' onChange={handleSubOptionChange} value={selectedSubOptionId}>
                                                    <option value="" disabled selected>소분류를 선택해주세요</option>
                                                    {subOptions.map((subOption) => (
                                                        <option key={subOption.id} value={subOption.id}>
                                                            {subOption.categoryName} (+{subOption.additionalPrice}원)
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedSubOptionId.length > 0 &&
                                                    <button type="button" className="product-select-button" onClick={handleAddItem}>선택</button>
                                                }
                                            </>
                                        )}
                                    </li>
                                    {selectedItems.length > 0 && (
                                        <li style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
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
                                                            <li style={{ textAlign: 'right', listStyleType: 'none', fontSize: '17px' }}>
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
                                <div style={{ fontSize: '20px', padding: '15px' }} className='total-price'>
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

                {/* start : 상세정보, 후기 */}
                <div style={{ paddingTop: "10%", width: '80%', margin: '0 auto' }}>
                    <div>
                        <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px' }} />
                        <div style={{
                            display: 'flex',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            <div onClick={() => setChangeMenu("detail")} className="product-div">상세정보</div>
                            <div onClick={() => setChangeMenu("review")} className="product-div">후기</div>
                        </div>
                        <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px' }} />
                    </div>

                    <div>
                        {changeMenu === "detail" &&
                            <>
                                {
                                    // productList.length === 0 &&
                                    <div style={{ padding: '20px', textAlign: 'center' }}>등록된 정보가 없습니다.</div>
                                }
                                상세정보 내용
                            </>
                        }

                        {changeMenu === "review" &&
                            <>
                                {isPurchased && (
                                    <div style={{textAlign:'right'}}><img onClick={() => setReviewWrite(!reviewWrite)} src={reviewWriteBtn} alt="후기등록하기버튼" style={{ width: '80px', border: '1px solid #ddd', borderRadius: '50px' }} /></div>
                                )}

                                {/* 후기등록 */}
                                {reviewWrite &&
                                    <div className="review-container-style">
                                        <div style={{ margin: "10px 0", lineHeight: "1.8", fontWeight: "700" }}>
                                            {user.user.username}님, <br />
                                            구매하신 상품은 어떠셨나요?
                                        </div>
                                        <form onSubmit={handleSubmit} className="reviewForm">
                                            {/* 별점 */}
                                            <div className="review-star">
                                                <span style={{ fontSize: '12px', fontWeight: '700' }}>별점&nbsp;&nbsp;</span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={20}
                                                        fill={star <= rate ? "#FFD700" : "#ccc"}
                                                        stroke={star <= rate ? "#FFD700" : "#ccc"}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            if (rate === 1 && star === 1) {
                                                                setRate(0);
                                                            } else if (rate === 5 && star === 5) {
                                                                setRate(0);
                                                            } else {
                                                                setRate(star);
                                                            }
                                                        }}
                                                        className="star"
                                                    />
                                                ))}
                                            </div>
                                            {/*내용*/}
                                            <div><span style={{ fontSize: '12px', fontWeight: '700' }}>내용</span></div>
                                            <div style={{ textAlign: 'center' }}>
                                                <textarea className="review-content-style" id="reviewContent" name="reviewContent" value={reviewContent} onChange={handleData} placeholder="후기 내용을 작성해주세요." maxLength={230}></textarea>
                                                <div style={{ textAlign: 'right', margin: '5px 30px 5px 0' }}>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                                        {reviewContent.length} / 230
                                                    </p>
                                                </div>
                                            </div>
                                            {/*파일*/}
                                            <div><span style={{ fontSize: '12px', fontWeight: '700' }}>파일첨부</span></div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={handleDrop}
                                                    style={{
                                                        margin: '0 30px', height: '100px',
                                                        border: '2px dashed #ccc', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        marginBottom: '10px', cursor: 'pointer'
                                                    }}
                                                    onClick={() => fileInputRef.current.click()}
                                                >
                                                    이미지를 드래그/선택하여 1~5개 첨부해주세요
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <input
                                                        type="file" style={{ display: 'none' }} ref={fileInputRef}
                                                        multiple accept="image/*" onChange={changeFile}
                                                    />
                                                    <input type="button"
                                                        style={{
                                                            backgroundColor: 'rgb(85, 85, 85)', color: 'white', padding: '8px', border: 'none',
                                                            cursor: 'pointer', borderRadius: '5px', fontSize: '12px'
                                                        }}
                                                        onClick={() => fileInputRef.current.click()} value="이미지 선택"
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '15px', justifyContent: 'center' }}>
                                                    {reviewFiles.map((file, idx) => (
                                                        <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={file.name}
                                                                style={{
                                                                    width: '80%', height: '80%', objectFit: 'cover',
                                                                    borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    position: 'absolute', top: '-6px', right: '3px',
                                                                    backgroundColor: '#555', color: 'white',
                                                                    width: '20px', height: '20px',
                                                                    display: 'flex', alignItems: 'center',
                                                                    justifyContent: 'center', borderRadius: '50%',
                                                                    fontSize: '14px', cursor: 'pointer'
                                                                }}
                                                                onClick={() => removeFile(file)}>
                                                                ✕
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/*등록버튼*/}
                                            <div>
                                                <input type="submit" value="등록" className="reviewBtn-style" />
                                            </div>
                                        </form>
                                    </div>
                                }
                                {/* 현재 상품에 대한 후기 전체 리스트 */}
                                <div className="review-container">
                                    <h2 className="review-title">상품 후기</h2>
                                    <div className="review-grid">
                                        {reviewList.length > 0 ? (
                                            reviewList.map((review, index) => (
                                                <div key={index} className="review-card">
                                                    <div className="review-header">
                                                        {review.user.kakaoProfileUrl && 
                                                        <img src={review.user.kakaoProfileUrl.indexOf('http') !== -1 ? `${review.user.kakaoProfileUrl}` : `${serverIP.ip}${review.user.kakaoProfileUrl}`} 
                                                            alt="profile" 
                                                            className="profile-img"
                                                        />}
                                                        <div>
                                                            <p className="message-who" id={`mgx-${review.user.id}`} style={{cursor:'pointer'}}>{review.user.username}</p>
                                                            <p className="review-date">{new Date(review.reviewWritedate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <p className="review-rating">⭐ {review.rate}</p>
                                                    <p className="review-content">{review.reviewContent}</p>
                                                    {review.images && review.images.length > 0 && (
                                                        <div className="review-images">
                                                            {review.images.map((img, imgIndex) => (
                                                                <img key={imgIndex} src={`${serverIP.ip}/uploads/review/${review.id}/${img.filename}`} alt={`review-${imgIndex}`} className="review-image" />
                                                            ))}
                                                        </div>
                                                    )}
                                                    <button className="like-button" onClick={() => handleLike(review.id, user.user.id,review)}>
                                                        👍 { 0 || review.likes.length}
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="review-empty">아직 후기가 없습니다.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
                {/* end : 상세정보, 후기 */}
            </div>
        </>
    );
}

export default ProductInfo;