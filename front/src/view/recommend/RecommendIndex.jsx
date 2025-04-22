import { useSelector } from 'react-redux';
import './../../css/view/recommend.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function RecommendIndex(){
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);

    const [alreadyProducts, setAlreadyProducts] = useState([]);

    const [defaultProduct, setDefaultProduct] = useState(null);
    const [wishProduct, setWishProduct] = useState(null);
    const [basketProduct, setBasketProduct] = useState(null);
    const [hitProduct, setHitProduct] = useState(null);
    const [searchProduct, setSearchProduct] = useState(null);

    useEffect(()=>{
        getRecommendList();
    },[]);

    const getRecommendList = async () => {
        if (!user) return;
    
        const basePayload = { productIds: alreadyProducts };
    
        try {
            const wishRes = await axios.post(`${serverIP.ip}/recommend/getWishRecommend`,
                                                basePayload, 
                                                { headers: { Authorization: `Bearer ${user.token}` } });
            const wishId = wishRes.data.id;
            setAlreadyProducts(prev => [...prev, wishId]);
            setWishProduct(wishRes.data);
            
            const defaultRes = await axios.post(`${serverIP.ip}/recommend/getDefaultRecommend`,
                                { productIds: [...alreadyProducts, wishId] }, 
                                { headers: { Authorization: `Bearer ${user.token}` } });
            const defaultId = defaultRes.data.id;
            setAlreadyProducts(prev => [...prev, defaultId]);
            setDefaultProduct(defaultRes.data);
            
            const basketRes = await axios.post(`${serverIP.ip}/recommend/getBasketRecommend`, 
                                { productIds: [...alreadyProducts, wishId, defaultId]}, 
                                { headers: { Authorization: `Bearer ${user.token}` } });
    
            const basketId = basketRes.data.id;
            setAlreadyProducts(prev => [...prev, basketId]);
            setBasketProduct(basketRes.data);

            const hitRes = await axios.post(`${serverIP.ip}/recommend/getHitRecommend`, 
                                { productIds: [...alreadyProducts, wishId, defaultId, basketId]}, 
                                { headers: { Authorization: `Bearer ${user.token}` } });
    
            const hitId = hitRes.data.id;
            setAlreadyProducts(prev => [...prev, hitId]);
            setHitProduct(hitRes.data);

            const searchRes = await axios.post(`${serverIP.ip}/recommend/getSearchRecommend`, 
                                { productIds: [...alreadyProducts, wishId, defaultId, basketId, hitId]}, 
                                { headers: { Authorization: `Bearer ${user.token}` } });
    
            const searchId = searchRes.data.id;
            setAlreadyProducts(prev => [...prev, searchId]);
            setSearchProduct(searchRes.data);

        } catch (err) {
            console.log(err);
        }
    };


    return(
        <div className='recommend-container'>
            <h2 style={{textAlign: 'center'}}>💖{user.user.username}님을 위한 추천상품입니다.💝</h2>
            <ul className="recommend-sort">
                <li>1만원 미만</li>
                <li>1만원대</li>
                <li>2만원대</li>
                <li>3만원대</li>
                <li>5만원대</li>
                <li>6만원 이상</li>
            </ul>
            <button id="refresh-btn" onClick={getRecommendList}>⟳</button>
            <div className="recommend-list">
                <div className='recommend-product'>
                    장바구니: {basketProduct && basketProduct.productName}
                </div>
                <div className='recommend-product'>
                    검색: {searchProduct && searchProduct.productName}
                </div>
                <div className='recommend-product'>
                    찜: {wishProduct && wishProduct.productName}
                </div>
                <div className='recommend-product'>
                    방문: {hitProduct && hitProduct.productName}
                </div>
                <div className='recommend-product'>
                    리뷰: 
                </div>
                <div className='recommend-product'>
                    디폴트: {defaultProduct && defaultProduct.productName}
                </div>
            </div>
        </div>
    );
}

export default RecommendIndex;