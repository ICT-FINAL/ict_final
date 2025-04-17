import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

function MyReviewList(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const [userNo, setUserNo] = useState(0);
    const [loginNo, setLoginNo] = useState(0);

    const [myReviewList, setMyReviewList] = useState({});

    useEffect(() => {
        if (user) {
            setUserNo(loc.state === null ? user.user.id : loc.state);
            setLoginNo(user.user.id);
        }
    }, []);

    useEffect(() => {
        getMyReviewList();
    }, [])

    const getMyReviewList = () => {
        axios.get(`${serverIP.ip}/review/myReviewList/${userNo}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log("구매후기:", res.data);
            setMyReviewList(res.data);
        })
        .catch(err => console.log(err));
    }

    // 리뷰 이미지
    const [imageIndexes, setImageIndexes] = useState([]);

    useEffect(() => {
        setImageIndexes((prev) => {
            const updated = [...prev];
            for (let i = 0; i < myReviewList.length; i++) {
                if (updated[i] === undefined) {
                    updated[i] = 0;
                }
            }
            return updated;
        });
    }, [myReviewList]);

    const handlePrev = (reviewIndex, imagesLength) => {
        setImageIndexes((prev) => {
        const updated = [...prev];
        updated[reviewIndex] = updated[reviewIndex] === 0 ? imagesLength - 1 : updated[reviewIndex] - 1;
        return updated;
        });
    };

    const handleNext = (reviewIndex, imagesLength) => {
        setImageIndexes((prev) => {
        const updated = [...prev];
        updated[reviewIndex] = updated[reviewIndex] === imagesLength - 1 ? 0 : updated[reviewIndex] + 1;
        return updated;
        });
    };

    const [enlargedImage, setEnlargedImage] = useState(null);

    // 리뷰 수정 
    const [reviewFiles, setReviewFiles] = useState([]);
    const [rate, setRate] = useState(0);
    let [reviewContent, setReviewContent] = useState('');
    const [isMod, setIsMod] = useState(false); // 수정 모드인지 여부
    const [modReview, setModReview] = useState(null); // 수정할 리뷰 데이터

    const urlToFile = async (url, filename, mimeType) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: mimeType });
    };

    const handleModClick = (review) => {
        console.log(review);
    
        Promise.all(
            review.images.map(file =>
                urlToFile(
                    `${serverIP.ip}/uploads/review/${review.id}/${file.filename}`,
                    file.filename,
                    "image/jpeg"
                )
            )
        )
        .then(fileList => {
            setReviewFiles(fileList);
            setIsMod(true);
            setModReview(review);
            setRate(review.rate || 0);
            setReviewContent(review.reviewContent || '');
        })
        .catch(err => console.log(err));
    };
    

    return(
        <>
            <div>나의후기{userNo}</div>

            <div className="review-container">
                <div className="review-grid">
                    {myReviewList.length > 0 ? (
                        myReviewList.map((review, index)=>(
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
                                <div style={{padding:'0 45px'}}>
                                    {/* 리뷰 별점 */}
                                        <div className="star-rating-wrapper">
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
                                                    <span className="star" key={star} style={{ position: 'relative', width: '20px', height: '20px', fontSize:'20px' }}>
                                                        <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize:'20px' }} />
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            overflow: 'hidden',
                                                            width: backstarStyle.width,
                                                            height: '100%',
                                                        }}>
                                                            <FaStar style={{ color: backstarStyle.background, fontSize: '20px' }} />
                                                        </div>
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <p className="review-content">{review.reviewContent}</p>
                                        {review.images && review.images.length > 0 && (
                                            <div className="review-images-wrapper">
                                                <div className="review-slider-container">
                                                    {review.images.length > 1 && (
                                                        <button className="slider-arrow left" onClick={() => handlePrev(index, review.images.length)}>
                                                            ‹
                                                        </button>
                                                    )}
                                                    <div className="review-slider-image-wrapper">
                                                        {review.images[imageIndexes[index]] && (
                                                            <img
                                                                src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[imageIndexes[index]].filename}`}
                                                                alt={`review-img-${imageIndexes[index]}`}
                                                                className="review-custom-slider-image"
                                                                title="이미지 클릭시 확대하여 확인 가능"
                                                                onClick={() => setEnlargedImage({ reviewIndex: index, imageIndex: imageIndexes[index] })}
                                                            />
                                                        )}
                                                    </div>
                                                    {review.images.length > 1 && (
                                                        <button className="slider-arrow right" onClick={() => handleNext(index, review.images.length)}>
                                                            ›
                                                        </button>
                                                    )}
                                                    {/* 슬라이더 점 표시 */}
                                                    {review.images.length > 1 && (
                                                        <div className="slider-dots">
                                                            {review.images.map((_, dotIndex) => (
                                                            <span
                                                                key={dotIndex}
                                                                className={`dot ${dotIndex === imageIndexes[index] ? 'active' : ''}`}
                                                            ></span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* 확대 이미지 오버레이 */}
                                                {enlargedImage?.reviewIndex === index && (
                                                    <div className="image-overlay" onClick={() => setEnlargedImage(null)}>
                                                        {/* 왼쪽 화살표 */}
                                                        {review.images.length > 1 && (
                                                            <button
                                                                className="overlay-arrow left"
                                                                onClick={(e) => {
                                                                    handlePrev(index, review.images.length);
                                                                    e.stopPropagation();
                                                                    setEnlargedImage((prev) => {
                                                                        const total = review.images.length;
                                                                        const newIndex = prev.imageIndex === 0 ? total - 1 : prev.imageIndex - 1;
                                                                        return { ...prev, imageIndex: newIndex };
                                                                    });
                                                                }}
                                                            >
                                                                ‹
                                                            </button>
                                                        )}
                                                        
                                                        <div style={{position:'relative', marginTop:'130px'}}>
                                                            {/* 확대된 이미지 */}
                                                            <img
                                                                src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[enlargedImage.imageIndex].filename}`}
                                                                alt="enlarged"
                                                                className="popup-image"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />

                                                            {/* 닫기 X 버튼 */}
                                                            <button
                                                                className="overlay-close"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // 클릭 시 이벤트 전파 방지
                                                                    setEnlargedImage(null); // 이미지 닫기
                                                                }}
                                                            >
                                                            X
                                                            </button>
                                                        </div>

                                                        {/* 오른쪽 화살표 */}
                                                        {review.images.length > 1 && (
                                                            <button className="overlay-arrow right"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNext(index, review.images.length);
                                                                    setEnlargedImage((prev) => {
                                                                        const total = review.images.length;
                                                                        const newIndex = prev.imageIndex === total - 1 ? 0 : prev.imageIndex + 1;
                                                                        return { ...prev, imageIndex: newIndex };
                                                                    });
                                                                }}
                                                            >
                                                                ›
                                                            </button>
                                                        )}
                                                        {/* 슬라이더 점 표시 */}
                                                        {review.images.length > 1 && (
                                                            <div className="slider-dots">
                                                                {review.images.map((_, dotIndex) => (
                                                                    <span key={dotIndex} className={`dot ${dotIndex === imageIndexes[index] ? 'active' : ''}`}></span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {user.user.id === review.user.id && (
                                                            <div className="review-action-buttons">
                                                                <button className="edit-button" onClick={() => handleModClick(review)}>수정</button>
                                                                <button id={`review-delll-${review.id}`} className="del-button">삭제</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>⭐ 작성된 리뷰가 없습니다.</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default MyReviewList;