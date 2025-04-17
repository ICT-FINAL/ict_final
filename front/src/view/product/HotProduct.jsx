import { useEffect, useState } from 'react';
import '../../css/view/hotproduct.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HotProduct() {
    const [categoryList, setCategoryList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const itemsPerPage = 4;
    const cardWidth = 284;
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${serverIP.ip}/product/getList/hotCategory`)
            .then((res) => {
                setCategoryList(res.data);
                if (res.data.length > 0)
                    handleCategoryClick(res.data[0].productCategory);
            })
            .catch((err) => console.log(err));
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setCurrentSlide(0);

        axios.get(`${serverIP.ip}/product/getList/byCategory?category=${category}`)
            .then((res) => {
                setProductList(res.data);
                console.log(res.data);
            })
            .catch((err) => console.log(err));
    };

    const handleNext = () => {
        if (currentSlide < productList.length - itemsPerPage) {
            setCurrentSlide(currentSlide + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const getTransformX = () => {
        return -currentSlide * cardWidth;
    };

    const moveInfo = (prod) => {
        console.log(prod);
        navigate('/product/info', { state: { product: prod } });
    }

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    return (
        <>
            <div className="search-page-banner">
            <h1>🏆 인기 카테고리 TOP 확인하기!</h1>
            <p>🛍️ 지금 사람들이 많이 고른 핸드메이드 아이템은?</p>
            </div>
            <ul className='hot-category-list'>
                {categoryList.map((item, index) => (
                    <li
                        key={index}
                        className={`hot-category-btn ${selectedCategory === item.productCategory ? 'hot-active' : ''}`}
                        onClick={() => handleCategoryClick(item.productCategory)}
                    >
                        {item.productCategory}
                    </li>
                ))}
            </ul>
            <div className="hot-list">
                {selectedCategory && (
                    <div className="hot-slider-container">
                        <button className="hot-slide-btn" onClick={handlePrev}>{'<'}</button>
                        <div className="hot-product-cards-wrapper">
                            <div
                                className="hot-product-cards"
                                style={{ transform: `translateX(${getTransformX()}px)` }}
                            >
                                {productList.map((product, index) => (
                                    <div className="hot-product-card" key={index}>
                                        <div className="hot-card-content" style={{cursor:'pointer'}} onClick={()=>moveInfo(product)}>
                                            <img width='100%' src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0].filename}`}/>
                                            {product.productName}<br />
                                            {formatNumberWithCommas(product.price)}원
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="hot-slide-btn" onClick={handleNext}>{'>'}</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default HotProduct;
