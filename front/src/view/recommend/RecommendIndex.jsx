import { useSelector } from 'react-redux';
import './../../css/view/recommend.css';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import RecommendSpinner from '../../effect/RecommendSpinner';

function RecommendIndex() {
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);

    const youEnd = false;

    const [wishProduct, setWishProduct] = useState(null);
    const [basketProduct, setBasketProduct] = useState(null);
    const [hitProduct, setHitProduct] = useState(null);
    const [searchProduct, setSearchProduct] = useState(null);
    const [reviewProduct, setReviewProduct] = useState(null);
    const [defaultProduct, setDefaultProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState('');

    const alreadyProducts = useRef([]);

    useEffect(() => {
        getRecommendList();
    }, [priceRange]);

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
        alreadyProducts.current = [];
    };

    const getRecommendList = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const basePayload = { productIds: alreadyProducts.current, priceRange };

            const wishRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=WISH`,
                basePayload,
                { headers: { Authorization: `Bearer ${user.token}` } });
            const wishId = wishRes.data.id;
            if (!alreadyProducts.current.includes(wishId)) {
                alreadyProducts.current.push(wishId);
            }
            setWishProduct(wishRes.data);

            const basketRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=BASKET`,
                { productIds: [...alreadyProducts.current, wishId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const basketId = basketRes.data.id;
            if (!alreadyProducts.current.includes(basketId)) {
                alreadyProducts.current.push(basketId);
            }
            setBasketProduct(basketRes.data);

            const hitRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=HIT`,
                { productIds: [...alreadyProducts.current, wishId, basketId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const hitId = hitRes.data.id;
            if (!alreadyProducts.current.includes(hitId)) {
                alreadyProducts.current.push(hitId);
            }
            setHitProduct(hitRes.data);

            const searchRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=SEARCH`,
                { productIds: [...alreadyProducts.current, wishId, basketId, hitId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const searchId = searchRes.data.id;
            if (!alreadyProducts.current.includes(searchId)) {
                alreadyProducts.current.push(searchId);
            }
            setSearchProduct(searchRes.data);

            const reviewRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=REVIEW`,
                { productIds: [...alreadyProducts.current, wishId, basketId, hitId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const reviewId = reviewRes.data.id;
            if (!alreadyProducts.current.includes(reviewId)) {
                alreadyProducts.current.push(reviewId);
            }
            setReviewProduct(reviewRes.data);

            const defaultRes = await axios.post(`${serverIP.ip}/recommend/getDefaultRecommend`,
                { productIds: [...alreadyProducts.current, wishId, basketId, hitId, searchId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const defaultId = defaultRes.data.id;
            if (!alreadyProducts.current.includes(defaultId)) {
                alreadyProducts.current.push(defaultId);
            }
            setDefaultProduct(defaultRes.data);
            console.log(defaultRes.data);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    const allProductsEmpty =
        !wishProduct &&
        !basketProduct &&
        !hitProduct &&
        !searchProduct &&
        !reviewProduct &&
        !defaultProduct;

    return (
        <div className='recommend-container'>
            <h2 style={{ textAlign: 'center', fontSize: '28px' }}>
                💖{user.user.username}님을 위한 추천상품입니다.💝
            </h2>
            <ul className="recommend-sort">
                <li className={priceRange === '' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('')}>전체</li>
                <li className={priceRange === 'under10000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('under10000')}>1만원 미만</li>
                <li className={priceRange === '10000to20000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('10000to20000')}>1만원대</li>
                <li className={priceRange === '20000to30000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('20000to30000')}>2만원대</li>
                <li className={priceRange === '30000to50000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('30000to50000')}>3만원대</li>
                <li className={priceRange === '50000to60000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('50000to60000')}>5만원대</li>
                <li className={priceRange === 'over60000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('over60000')}>6만원 이상</li>
            </ul>
            <button id="refresh-btn" onClick={getRecommendList} disabled={loading || allProductsEmpty}>
                ⟳
            </button>

            <div className="recommend-list" style={{ position: 'relative' }}>
                {loading ? (
                    <RecommendSpinner />
                ) : (
                    allProductsEmpty ? (
                        <div
                            style={{
                                textAlign: 'center',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%,-50%)',
                                fontSize: '20px'
                            }}
                        >
                            { !youEnd? '현의님 힘내고 🤣':'추천 상품이 더이상 없어요 😢'}
                        </div>
                    ) : (
                        <> { wishProduct &&
                            <div className='recommend-product'>
                                <img width='100%' height='150px' src={`${serverIP.ip}/uploads/product/${wishProduct.id}/${wishProduct.images[0].filename}`}/>
                                찜: {wishProduct && wishProduct.productName}
                            </div>
                            }
                            { basketProduct &&
                            <div className='recommend-product'>
                            <img width='100%' height='150px' src={`${serverIP.ip}/uploads/product/${basketProduct.id}/${basketProduct.images[0].filename}`}/>
                                장바구니: {basketProduct && basketProduct.productName}
                            </div>
                            }
                            { hitProduct &&
                            <div className='recommend-product'>
                            <img width='100%' height='150px' src={`${serverIP.ip}/uploads/product/${hitProduct.id}/${hitProduct.images[0].filename}`}/>
                                방문: {hitProduct && hitProduct.productName}
                            </div>
                            }
                            { searchProduct &&
                            <div className='recommend-product'>
                            <img width='100%' height='150px' src={`${serverIP.ip}/uploads/product/${searchProduct.id}/${searchProduct.images[0].filename}`}/>
                                검색: {searchProduct && searchProduct.productName}
                            </div>
                            }
                            { reviewProduct &&
                            <div className='recommend-product'>
                            <img width='100%' height='150px' src={`${serverIP.ip}/uploads/product/${reviewProduct.id}/${reviewProduct.images[0].filename}`}/>
                                리뷰: {reviewProduct && reviewProduct.productName}
                            </div>
                            }
                            {defaultProduct &&
                            <div className='recommend-product'>
                            <img width='100%' height='150px' src={`${serverIP.ip}/uploads/product/${defaultProduct.id}/${defaultProduct.images[0].filename}`}/>
                                디폴트: {defaultProduct && defaultProduct.productName}
                            </div>
                            }
                        </>
                    )
                )}
            </div>
        </div>
    );
}

export default RecommendIndex;