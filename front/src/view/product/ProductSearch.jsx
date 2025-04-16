import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { setSearch } from "../../store/searchSlice";
import { setModal } from "../../store/modalSlice";
import { FaStar } from "react-icons/fa";
import useDebounce from "../../effect/useDebounce";

function ProductSearch() {
    const search = useSelector((state) => state.search);
    const [products, setProducts] = useState([]);
    const [nowPage, setNowPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const debouncedSearchWord = useDebounce(search.searchWord, 500);

    const eventOptions = ["생일", "결혼", "졸업", "시험", "출산", "기타"];
    const targetOptions = ["여성", "남성", "연인", "직장동료", "부모님", "선생님", "기타"];
    const productOptions = {
        "디저트": ["베이커리", "떡", "초콜릿", "음료"],
        "수제먹거리": ["건강식품", "간편식", "가공식품", "반찬", "소스/장류"],
        "농축수산물": ["과일/채소", "잡곡/견과", "정육/계란", "수산물"],
        "의류": ["홈웨어/언더웨어", "티셔츠/니트", "바지/스커트", "아우터"],
        "패션잡화": ["신발", "모자", "가방", "지갑"],
        "홈인테리어": ["가구", "꽃", "캔들", "홈데코"],
        "주방/생활": ["주방용품", "욕실"],
        "케이스": ["폰케이스", "노트북케이스"],
        "문구": ["인형", "장난감", "다이어리", "노트", "필기도구"],
        "일러스트/사진": ["드로잉", "사진"],
        "화장품": ["네일", "메이크업", "향수"],
        "기타": ["기타"]
    };

    const { ref, inView } = useInView({
        threshold: 0.5, // 50% 보이면
    });

    useEffect(() => {
        setProducts([]);
        setNowPage(1);
        getProductList(1);
    }, [debouncedSearchWord, search.eventCategory, search.targetCategory, search.productCategory]);

    useEffect(() => {
        if (nowPage > 1) {
            getProductList(nowPage);
        }
    }, [nowPage]);

    useEffect(() => {
        if (inView && nowPage < totalPage) {
            setNowPage((prevPage) => prevPage + 1);
        }
    }, [inView, totalPage]);

    const moveInfo = (prod) => {
        console.log(prod);
        navigate('/product/info', { state: { product: prod } });
    }

    const changeSearchWord = (e) => {
        dispatch(setSearch({ ...search, searchWord: e.target.value }));
    }

    const getProductList = (page) => {
        axios
            .get(
                `${serverIP.ip}/product/search?searchWord=${search.searchWord}&eventCategory=${search.eventCategory}&targetCategory=${search.targetCategory}&productCategory=${search.productCategory}&nowPage=${page}`,
            )
            .then((res) => {
                const { pvo, productList } = res.data;

                setProducts((prev) => {
                    if (page === 1) return productList;
                    return [...prev, ...productList];
                });

                setTotalPage(pvo.totalPage);

                 // 각 상품에 대해 별점과 리뷰 개수 불러오기
                productList.forEach(product => {
                    axios.get(`${serverIP.ip}/review/averageStar?productId=${product.id}`)
                        .then((res) => {
                            const { average, reviewCount } = res.data;
                            // 상품에 별점과 리뷰 개수 추가
                            product.average = average;
                            product.reviewCount = reviewCount;
                        })
                        .catch((err) => console.log(err));
                });

                console.log(productList);
            })
            .catch((err) => {
                console.log(err)
            });
    };

    {/* 평균 별점, 리뷰 갯수 구하기 */}
    const [averageStar, setAverageStar] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    // useEffect(() => {
    //     axios.get(`${serverIP.ip}/review/averageStar?productId=${loc.state.product.id}`)
    //     .then(res => {
    //         console.log(res.data); 
    //         setAverageStar(res.data.average);
    //         setReviewCount(res.data.reviewCount);
    //     })
    //     .catch(err => console.log(err));
    // }, []);

    return (
        <div className="product-grid-container">
            <h2 style={{ fontSize: '28px' }}>{search.searchWord && `'${search.searchWord}'`} 상품 검색 결과</h2>
            <div style={{ maxWidth: '1200px', margin: 'auto' }}>
                <div className="search-options-container">
                    <select
                        value={search.eventCategory}
                        onChange={(e) => dispatch(setSearch({ ...search, eventCategory: e.target.value }))}
                        className="search-selectbox-style"
                    >
                        <option value="">이벤트 선택</option>
                        {eventOptions.map((event, index) => (
                            <option key={index} value={event}>{event}</option>
                        ))}
                    </select>

                    <select
                        value={search.targetCategory}
                        onChange={(e) => dispatch(setSearch({ ...search, targetCategory: e.target.value }))}
                        className="search-selectbox-style"
                    >
                        <option value="">대상 선택</option>
                        {targetOptions.map((target, index) => (
                            <option key={index} value={target}>{target}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => dispatch(setModal({
                            ...modal,
                            isOpen: true,
                            selected: "categorymodal",
                            info: productOptions,
                        }))}
                        className="search-selectbox-style"
                        style={{
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                        }}
                    >
                        {search.productCategory.length === 0
                            ? '카테고리 선택'
                            : search.productCategory.map((item, index) => (
                                <span key={index}> #{item}</span>
                            ))
                        }
                    </button>

                    <div className="search-container">
                        <svg className="search-icon-two" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="7" stroke="#555" strokeWidth="2" />
                            <line x1="15" y1="15" x2="22" y2="22" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            className="search-info-style"
                            type="text"
                            value={search.searchWord}
                            placeholder="검색어 입력"
                            onChange={changeSearchWord}
                        />
                    </div>
                </div>
            </div>
            <div className="product-grid">
                {products.map((product, index) => (
                    <div
                        key={`${product.id}-${index}`}
                        className="product-card"
                        ref={index === products.length - 1 ? ref : null}
                    >
                        <img style={{ cursor: 'pointer' }} onClick={() => moveInfo(product)}
                            src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0]?.filename}`}
                            alt={product.productName}
                            className="w-full h-40 object-cover"
                        />
                        <div style={{ cursor: 'pointer' }} onClick={() => moveInfo(product)} className="product-info">
                            <span style={{ fontSize: "14px", color: "#333" }}>{product.productName}</span> {/* 상품명 */} <br />
                            <span style={{ color: 'red', fontWeight: "700" }}>{product.discountRate}%</span> {/* 할인 */}
                            <span style={{ textDecoration: "line-through", textDecorationColor: "red", textDecorationThickness: "2px", fontWeight: "700" }}>{product.price.toLocaleString()}원</span> {/* 기존 가격 */}
                            <span style={{ color: 'red', fontWeight: "700" }}>{Math.round(product.price * (1 - product.discountRate / 100)).toLocaleString()}원</span> {/* 할인된가격 */}

                            <br />
                            <div style={{
                                marginTop: "5px", padding: "4px 8px", display: "inline-block",
                                borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                                backgroundColor: product.shippingFee === 0 ? "#ff4d4d" : "#f2f2f2",
                                color: product.shippingFee === 0 ? "white" : "black",
                                minHeight: "10px",
                                lineHeight: "10px" // 가운데 정렬
                            }}>
                                {product.shippingFee === 0 ? "🚚 무료배송" : `배송비 ${product.shippingFee}원`} {/* 배송비 */}
                            </div>

                            {/* 별과 평균 별점, 리뷰 개수 */}
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3px' }}>
                                <FaStar style={{ color: '#FFD700', fontSize: '15px' }} />
                                <div style={{ marginLeft: '8px', fontSize: '12px', color: '#555' }}>
                                    <b>{product.average ? product.average.toFixed(1) : '0.0'}</b>
                                    <span style={{ marginLeft: '4px', color: '#999' }}>
                                        ({product.reviewCount})
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductSearch;
