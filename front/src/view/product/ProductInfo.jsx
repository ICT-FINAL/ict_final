import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

function ProductInfo() {
    const serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);

    const navigate = useNavigate();

    useEffect(()=>{
        console.log(loc.state.product);
    },[])

    const moveBuy = () => {
        navigate('/product/buying'); // 필요한 정보 state담아서 후에 처리
    }

    return (
        <div style={{ paddingTop: "140px" }}>
            <div className="product-info-container">
                <div className="product-info-left">
                    <img
                        id="product-big-img"
                        src={`${serverIP.ip}/uploads/product/${loc.state.product.id}/${loc.state.product.images[imageIndex].filename}`}
                        alt="상품 이미지"
                    />
                    <ul className="product-thumbnail-list">
                        {loc.state.product.images.map((img, idx) => (
                            <li key={idx} className={`thumbnail-item ${idx === imageIndex ? "active" : ""}`}>
                                <img
                                    src={`${serverIP.ip}/uploads/product/${loc.state.product.id}/${img.filename}`}
                                    alt={`Thumbnail ${idx}`}
                                    onClick={() => setImageIndex(idx)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="product-info-right">
                    <ul>
                        <li style={{display:'flex'}}>
                            <div className='product-profile-box'>
                                <img id={`mgx-${loc.state.product.sellerNo.id}`} className='message-who' src = {loc.state.product.sellerNo.uploadedProfileUrl && loc.state.product.sellerNo.uploadedProfileUrl.indexOf('http') !==-1 ? `${loc.state.product.sellerNo.uploadedProfileUrl}`:`${serverIP.ip}${loc.state.product.sellerNo.uploadedProfileUrl}`} alt='' width={40} height={40} style={{borderRadius:'100%', backgroundColor:'white', border:'1px solid gray'}}/>
                                <div id={`mgx-${loc.state.product.sellerNo.id}`} className='message-who' style={{height:'40px',lineHeight:'40px',marginLeft:'5px'}}>{loc.state.product.sellerNo.username} &gt;</div>
                            </div>
                            <div className='product-star-rating'>
                                ★★★★★ <span style={{color:'black'}}>{loc.state.product.rating}</span>
                            </div>
                        </li>
                        <li style={{display:'flex', marginTop:'20px', fontSize:'25px',lineHeight:'30px'}}>
                            <div className='product-info-name'>
                                {loc.state.product.productName}
                            </div>
                            <div className='product-wish'>
                                <div className="wishlist-icon">
                                    <FaHeart />
                                    <span>좋아요</span>
                                </div>
                                <div className="cart-icon">
                                    <FaShoppingCart />
                                    <span>장바구니</span>
                                </div>
                            </div>
                        </li>
                        <li style={{height:'350px', border:'1px solid gray', marginTop:'10px'}}>
                            대충 내용들 가격 등등..
                        </li>
                        <li>
                            <button className='product-buy-button' onClick={()=>moveBuy()}>
                                구매하기
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ProductInfo;
