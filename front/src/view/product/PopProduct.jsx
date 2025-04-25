import { useEffect, useState } from 'react';
import '../../css/view/hotproduct.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PopProduct() {
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
                <h1>이 달의 MIMYO 인기 작가💕💕</h1>
                <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
                    손끝에서 피어나는 감성,
                    <span style={{ fontWeight: '600', color: '#8CC7A5' }}>
                    이번 달 가장 주목받는 MIMYO 작가</span>들을 소개합니다 🌿
                </p>
            </div>
            <div className="pop-list" style={{textAlign:'center'}}>
                팝팝
            </div>
        </>
    );
}

export default PopProduct;
