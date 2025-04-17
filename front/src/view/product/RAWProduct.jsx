import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RAWProduct() {
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
                <h1>✨리뷰와 찜이 증명한 인기 작품!💖</h1>
                <p>사람들이 좋아하는 핸드메이드 아이템을 지금 확인해보세요</p>
            </div>
        </>
    );
}

export default RAWProduct;
