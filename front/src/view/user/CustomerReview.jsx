import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function CustomerReview(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();

    const [userNo, setUserNo] = useState(0);
    const [loginNo, setLoginNo] = useState(0);
    let [cusReviewList, setCusReviewList] = useState([]);

    useEffect(() => {
        if (user) {
            setUserNo(loc.state === null ? user.user.id : loc.state);
            setLoginNo(user.user.id);
        }
    }, []);

    useEffect(() => {
        if (loginNo !== 0) {
            getProductList();
        }
    }, [loginNo])

    const getProductList = () => {
        axios.get(`${serverIP.ip}/mypage/productList/${userNo}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log("판매작품1:", res.data[0].id);
            console.log("판매작품2:", res.data[1].id);

            const productIds = res.data.map(product => product.id);
            console.log("상품 ID 리스트", productIds);

            getCusReviewList(productIds);
        })
        .catch(err => console.log(err));
    }


    const getCusReviewList = (productIds) => {
        const params = { productIds: productIds };

        axios.post(`${serverIP.ip}/review/cusReviewList`, params, {
            headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            console.log("후기 리스트 응답:", res.data);
            setCusReviewList(res.data);
        })
        .catch(err => console.log(err));
    }

    // 리뷰 이미지 슬라이드 기능
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = (images) => {
        if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
        } else {
        setCurrentIndex(0);
        }
    };

    const prevSlide = (images) => {
        if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        } else {
        setCurrentIndex(images.length - 1);
        }
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return(
        <>
            <div>
                {cusReviewList && Object.entries(cusReviewList).map(([productId, reviews]) => (
                    <div key={productId}>
                        <div className="cusReview-wrapper">
                            <ul className="cusReview-list">
                                {reviews.map((review, index) => (
                                    <>
                                    {/* 리뷰 정보 */}
                                    <li key={index} className="cusReview-item">
                                        <div className="cusReview-header">
                                            {review.user.profileImageUrl && 
                                                <img src={review.user.profileImageUrl.indexOf('http') !== -1 ? `${review.user.profileImageUrl}` : `${serverIP.ip}${review.user.profileImageUrl}`} 
                                                    alt="profile" 
                                                    className="profile-img"
                                                />
                                            }
                                            <p className="message-who" id={`mgx-${review.user.id}`} style={{cursor:'pointer', fontSize:'14px'}}>{review.user.username}</p>
                                            <p className="cusReview-date" >{review.reviewWritedate}</p>

                                            {/* 리뷰 별점 */}
                                            <div className="cusReview-star-rating-wrapper">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    let backstarStyle = null;

                                                    if (review.rate >= star) {
                                                        backstarStyle = { background: '#FFD700', width: '100%' };
                                                    } else if (review.rate >= star - 0.5) {
                                                        backstarStyle = { background: '#FFD700', width: '50%' };
                                                    } else {
                                                        backstarStyle = { background: '#C0C0C0', width: '100%' };
                                                    }

                                                    return (
                                                        <span className="cusReview-star" key={star} style={{ position: 'relative', width: '15px', height: '15px', fontSize:'15px' }}>
                                                            <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize:'15px' }} />
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                overflow: 'hidden',
                                                                width: backstarStyle.width,
                                                                height: '100%',
                                                            }}>
                                                                <FaStar style={{ color: backstarStyle.background, fontSize: '15px' }} />
                                                            </div>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            
                                        </div>

                                        {/* 이미지 슬라이드 */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="cusReview-images-wrapper">
                                                {/* 이전 화살표 */}
                                                <button
                                                className="cusReview-arrow cusReview-prev"
                                                onClick={() => prevSlide(review.images)}
                                                >
                                                &#8249;
                                                </button>

                                                {/* 현재 이미지 */}
                                                <img
                                                src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[currentIndex].filename}`}
                                                alt={`Review Image ${currentIndex}`}
                                                className="cusReview-image"
                                                />

                                                {/* 다음 화살표 */}
                                                <button
                                                className="cusReview-arrow cusReview-next"
                                                onClick={() => nextSlide(review.images)}
                                                >
                                                &#8250;
                                                </button>

                                                {/* 점 네비게이션 */}
                                                <div className="cusReview-image-dots">
                                                {review.images.map((_, imgIndex) => (
                                                    <button
                                                    key={imgIndex}
                                                    className={`cusReview-dot ${currentIndex === imgIndex ? "active" : ""}`}
                                                    onClick={() => goToSlide(imgIndex)}
                                                    ></button>
                                                ))}
                                                </div>
                                            </div>
                                        )}

                                        
                                        <div className="cusReview-content">
                                            <p>{review.reviewContent}</p>
                                        </div>

                                        {/* 상품 정보 출력 */}
                                        <div className="cusReview-product-info">
                                            {reviews[0]?.product && (
                                                <>
                                                    {reviews[0].product.images && reviews[0].product.images.length > 0 && (
                                                        <div className="cusReview-product-image">
                                                            <img
                                                                src={`${serverIP.ip}/uploads/product/${reviews[0].product.id}/${reviews[0].product.images[0].filename}`}
                                                                alt={`Product Thumbnail`}
                                                                className="cusReview-image-thumbnail"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="cusReview-product-details">
                                                        <div className="cusReview-product-name">
                                                            {reviews[0].product.productName}
                                                        </div>
                                                        <div className="cusReview-product-price">
                                                            {reviews[0].product.price.toLocaleString()}원
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                    </>
                                ))}
                            </ul>
                        </div>

                        
                    </div>
                ))}
            </div>
        </>
    )
}

export default CustomerReview;