import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

function ProductSearch() {
    const search = useSelector((state) => state.search);
    const [products, setProducts] = useState([]);
    const [nowPage, setNowPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    
    const navigate = useNavigate();

    const { ref, inView } = useInView({
        threshold: 0.5, // 50% 보이면
    });

    useEffect(() => {
        setProducts([]);
        setNowPage(1);
        getProductList(1);
    }, [search.searchWord]);

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
        navigate('/product/info',{state:{product:prod}});
    }

    const getProductList = (page) => {
        axios
            .get(
                `${serverIP.ip}/product/search?searchWord=${search.searchWord}&nowPage=${page}`,
                user && { headers: { Authorization: `Bearer ${user.token}` } }
            )
            .then((res) => {
                const { pvo, productList } = res.data;

                setProducts((prev) => {
                    if (page === 1) return productList;
                    return [...prev, ...productList];
                });

                setTotalPage(pvo.totalPage);
            })
            .catch((err) => {
                console.log(err)
            });
    };

    return (
        <div className="product-grid-container">
            <h2>상품 검색 결과</h2>
            <p>'{search.searchWord}' 에 대한 검색 결과</p>
            <div className="product-grid">
                {products.map((product, index) => (
                    <div
                        key={`${product.id}-${index}`}
                        className="product-card"
                        ref={index === products.length - 1 ? ref : null}
                    >
                        <img style={{cursor:'pointer'}} onClick={() => {moveInfo(product)}}
                            src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0]?.filename}`}
                            alt={product.productName}
                            className="w-full h-40 object-cover"
                        />
                        <div style={{cursor:'pointer'}} onClick={() => {moveInfo(product)}}
                        className="product-info">
                            <p>{product.productName}</p>
                            <p>{product.price}원</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductSearch;
