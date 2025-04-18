import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

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
    }, [userNo])

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
    
    // 리뷰 클릭 시 다른 페이지로 이동
    const navigate = useNavigate();
    const handleReviewClick = (product, reviewId) => {
        localStorage.setItem("currentReviewId", reviewId);
        navigate('/product/info', { state: { product: product } });
    };

    return(
        <>
            <div className="myReview-box">
                <div style={{fontSize:'12px', color:'#8CC7A5'}}>* 내용을 클릭하면 관련 상품의 리뷰로 이동하여 수정 및 삭제가 가능합니다.</div>

                <ul className="mypage-myReview-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                    <li>번호</li>
                    <li>이름</li>
                    <li>내용</li>
                    <li>별점</li>
                    <li>이미지</li>
                    <li>등록일</li>
                </ul>
            
                {myReviewList.length > 0 ? (
                    myReviewList.map((review, index)=>(
                        <ul className="mypage-myReview-list" key={index}>
                            <li style={{lineHeight:'80px'}}>{index+1}</li>
                            <li style={{lineHeight:'80px'}}>{review.user.username}</li>
                            <li style={{lineHeight:'80px', cursor:'pointer'}} onClick={() => handleReviewClick(review.product, review.id)}>{review.reviewContent}</li>
                            <li>
                                <div className="star-rating-wrapper" style={{ display: 'flex', alignItems: 'center', height: '80px' }}>
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
                                        <span
                                        className="star"
                                        key={star}
                                        style={{
                                            position: 'relative',
                                            width: '15px',
                                            height: '15px',
                                            fontSize: '15px',
                                        }}
                                        >
                                        <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize: '15px' }} />
                                        <div
                                            style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            overflow: 'hidden',
                                            width: backstarStyle.width,
                                            height: '100%',
                                            }}
                                        >
                                            <FaStar style={{ color: backstarStyle.background, fontSize: '15px' }} />
                                        </div>
                                        </span>
                                    );
                                    })}
                                </div>
                            </li>
                            <li>
                                {review.images[imageIndexes[index]] && (
                                    <img
                                    src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[imageIndexes[index]].filename}`}
                                    alt={`review-img-${imageIndexes[index]}`}
                                    className="myReview-img"
                                    />
                                )}
                            </li>
                            <li style={{lineHeight:'80px'}}>{new Date(review.reviewWritedate).toLocaleDateString()}</li>
                        </ul>
                ))) : (
                    <p>⭐ 작성된 리뷰가 없습니다.</p>
                )}
            </div>
        </>
    )
}

export default MyReviewList;