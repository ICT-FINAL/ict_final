import { useSelector } from 'react-redux';
import './../../css/view/recommend.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function RecommendIndex(){
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);

    const [alreadyProducts, setAlreadyProducts] = useState([]);
    const [productList, setProductList] = useState([]);

    useEffect(()=>{
        refresh();
    },[]);

    const getRecommendProduct = ()=>{
        if (user) {
            axios.post(`${serverIP.ip}/recommend/getWishRecommend`, {productIds: alreadyProducts}
            , {
                headers: {Authorization: `Bearer ${user.token}`}
            })
            .then(res=>{
                console.log(res.data);
                setAlreadyProducts(prev=>
                    [...prev, res.data.id]
                );
                // setProductList(res.data);
            })
            .catch(err=>console.log(err));
        }
    }

    const refresh = () => {
        getRecommendProduct();
    }

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
            <button id="refresh-btn" onClick={refresh}>⟳</button>
            <div className="recommend-list">
                {
                    productList.map(prod=>{
                        return (
                            <div className='recommend-product'>
                                {prod}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default RecommendIndex;