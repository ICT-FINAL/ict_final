import { useState,useRef, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ProductEditor from '../product/ProductEditor';
import { useNavigate } from "react-router-dom";

function AuctionSell() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject:"",
        productName: "",
        eventCategory: "",
        targetCategory: "",
        productCategory: "",
        subCategories: "",
        detail: "",
        first_price: "",
        buy_now_price:"",
        deposit:"",
        options: [],
        shippingFee:"",
        endTime:"",
    });
    
    useEffect(() => {
        const now = new Date();
        const twoDaysLater = new Date(now);
        twoDaysLater.setDate(now.getDate() + 0);  // 2일 후  나중에 +2로바꾸기 테스트용 0
   
        const twoDaysLaterString = twoDaysLater.toISOString().slice(0, 16);

        setFormData({
          ...formData, endTime: twoDaysLaterString,
        });
    }, []);

     const now = new Date();
    const oneDayLater = new Date(now);
    oneDayLater.setDate(now.getDate() + 1);  // 1일 후

    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(now.getDate() + 2);  // 2일 후

    const nowString = now.toISOString().slice(0, 16);  // 현재 시간
    const oneDayLaterString = oneDayLater.toISOString().slice(0, 16);  // 1일 후의 시간
    const twoDaysLaterString = twoDaysLater.toISOString().slice(0, 16); 


    const calculateTotalQuantity = () => {
        let totalQuantity = 0;
    
        formData.options.forEach(option => {
            option.subOptions.forEach(subOption => {
                totalQuantity += subOption.quantity;
            });
        });
        return totalQuantity;
    };

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "discountRate") {
            const numericValue = Math.min(40, Math.max(0, parseFloat(value)));
            setFormData({
              ...formData,
              [name]: numericValue,
            });
          } else {
            setFormData({
              ...formData,
              [name]: value,
            });
          }
    };

    const handleCategoryChange = (e) => {
        setFormData({
            ...formData,
            productCategory: e.target.value,
            subCategories: "",
            options: []
        });
    };

    const handleSubCategoryChange = (sub) => {
        setFormData((prev) => ({
            ...prev,
            subCategories: prev.subCategories === sub ? "" : sub,
            options: []
        }));
    };

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const changeFile = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (selectedFiles) => {
        const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length !== selectedFiles.length) {
            alert("이미지 파일만 업로드 가능합니다.");
        }
        setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    // 대분류 옵션 입력값 유효성 검사 함수
    const validateMainOptions = () => {
        const emptyIndex = formData.options.findIndex(option => {
            return !option.mainOptionName || option.mainOptionName.trim() === "";
        });
    
        if (emptyIndex !== -1) {
            alert("대분류 옵션 이름을 입력해주세요.");
            setTimeout(() => document.getElementById(`mainOption-${emptyIndex}`)?.focus(), 0);
            return false;
        }
        return true;
    };

    const submitProduct = () => {
        /* focus를 위해 각각의 id값 추가 */
        //상품명 검사
        if (!formData.productName) {
            alert("상품명을 입력해주세요.");
            setTimeout(() => document.getElementById("productName").focus(), 0);
            return;
        }

        // 이벤트 카테고리 검사
        if (!formData.eventCategory) {
            alert("이벤트 카테고리를 선택해주세요.");
            setTimeout(() => document.getElementById("eventCategory").focus(), 0);
            return;
        }

        // 대상 카테고리 검사
        if (!formData.targetCategory) {
            alert("대상 카테고리를 선택해주세요.");
            setTimeout(() => document.getElementById("targetCategory").focus(), 0);
            return;
        }

        // 상품 카테고리 검사
        if (!formData.productCategory) {
            alert("상품 카테고리를 선택해주세요.");
            setTimeout(() => document.getElementById("productCategory").focus(), 0);
            return;
        }

    
        // 상세 설명 검사
        if (!formData.detail) {
            alert("상세 설명을 입력해주세요.");
            return;
        }

        if (!formData.shippingFee) {
            alert("배송비를 입력해주세요.");
            return;
        }

        // 이미지 검사
        if (files.length === 0) {
            alert("이미지를 최소 1개 이상 선택해주세요.");
            return;
        }

        let new_formData = new FormData();
    
        for (let i = 0; i < files.length; i++) {
            new_formData.append("files", files[i]);
        }

        const productData = {
            productName: formData.productName,
            eventCategory: formData.eventCategory,
            targetCategory: formData.targetCategory,
            productCategory: formData.productCategory,
            detail: formData.detail,
            firstPrice: parseInt(formData.first_price, 10) || 0,
            buyNowPrice: parseInt(formData.buy_now_price, 10) || 0,
            shippingFee:formData.shippingFee,
            endTime:formData.endTime,
            deposit:formData.buy_now_price*0.1,
            options: formData.options.map(option => ({
              mainOptionName: option.mainOptionName,
              quantity: option.quantity,
              subOptions: option.subOptions.map(subOption => ({
                subOptionName: subOption.subOptionName,
                quantity: subOption.quantity,
                additionalPrice: subOption.additionalPrice
              })),
            })),
          };

          new_formData.append("auction", new Blob([JSON.stringify(productData)], {
            type: "application/json"
          }));
          
          console.log(productData);
          
        axios.post(`${serverIP.ip}/auction/write`, new_formData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            alert("상품 등록 성공");
            navigate('/auction');
        })
        .catch(err => console.error("상품 등록 실패:", err));
    };

    return (
        <div style={{paddingTop:'150px'}}>
        <div className="product-form-container">
            <h2 className="product-form-title">경매 상품 등록</h2>

            <fieldset className="product-fieldset">
                <legend className="product-legend">기본 정보</legend>
                <label className="product-label">상품명</label>
                <input type="text" id="productName" name="productName" className="product-input" value={formData.productName} onChange={handleChange} />
            </fieldset>

            <fieldset className="product-fieldset">
                <legend className="product-legend">상품 정보</legend>
                <label className="product-label">이벤트</label>
                <select id="eventCategory" name="eventCategory" className="product-select" value={formData.eventCategory} onChange={handleChange}>
                    <option value="">선택</option>
                    {eventOptions.map((event) => (
                        <option key={event} value={event}>{event}</option>
                    ))}
                </select>

                <label className="product-label">대상</label>
                <select id="targetCategory" name="targetCategory" className="product-select" value={formData.targetCategory} onChange={handleChange}>
                    <option value="">선택</option>
                    {targetOptions.map((target) => (
                        <option key={target} value={target}>{target}</option>
                    ))}
                </select>

                <label className="product-label">상품 카테고리</label>
                <select id="productCategory" name="productCategory" className="product-select" value={formData.productCategory} onChange={handleCategoryChange}>
                    <option value="">선택</option>
                    {Object.keys(productOptions).map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                
                    
                <label className="product-label">수량</label>
                <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        disabled
                        className="product-input"
                        placeholder="수량은 옵션 선택시 자동 산정됩니다."
                        value={formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity}
                        readOnly={formData.options.length > 0}
                        onChange={handleChange}
                    /> 
                <label className="product-label">시작 가격</label>
                <input type="text" id="first_price" name="first_price" className="product-input" value={formData.first_price} onChange={handleChange} />

                <label className="product-label">즉시 구매 가격</label>
                <input type="text" id="buy_now_price" name="buy_now_price" className="product-input" value={formData.buy_now_price} onChange={handleChange} />
                    <label className="product-label">배송비</label>
                    <input type="text" id="shippingFee" name="shippingFee" className="product-input" value={formData.shippingFee} onChange={handleChange} />
                    <label className="product-label">보증금</label>
                    <input type="number" id="deposit" name="deposit" className="product-input" readOnly value={parseInt(formData.buy_now_price*0.1)} onChange={handleChange} />
                    <label className="product-label">시작 시간</label>
                    <input type="text" disabled className="product-input" value={'경매 등록 시간으로 설정됩니다.'} onChange={handleChange} />
                    <label className="product-label">종료 시간</label>
                    <input
                        type="datetime-local"
                        id="endTime"
                        name="endTime"
                        className="product-input"
                        value={formData.endTime}
                        onChange={handleChange}
                        min={oneDayLaterString}  // 최소값 현재 시간
                        max={twoDaysLaterString}  // 최대값 2일 후의 시간
                    />
            </fieldset>

            <fieldset className="product-fieldset">
                <legend className="product-legend">상세 정보</legend>
                <label className="product-label">상세 설명</label>
                <ProductEditor id='content' formData={formData} setFormData={setFormData}/>
                </fieldset>
            <div style={{fontWeight:'bold', marginBottom:'10px',fontSize:'18px'}}>썸네일 등록</div>
            <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                style={{
                    width: '100%', 
                    height: '150px', 
                    border: '2px dashed #ccc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '10px',
                    cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current.click()}
            >
                이미지를 드래그/선택하여 1~5개 첨부해주세요
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={changeFile}
                />
                <button 
                    style={{ 
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} 
                    onClick={() => fileInputRef.current.click()}
                >
                    이미지 선택
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {files.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }} 
                        />
                        <span 
                            style={{
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px', 
                                backgroundColor: '#555', 
                                color: 'white', 
                                width: '20px', 
                                height: '20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '50%', 
                                fontSize: '14px', 
                                cursor: 'pointer'
                            }}
                            onClick={() => removeFile(file)}
                        >
                            ✕
                        </span>
                    </div>
                ))}
            </div>
            <button onClick={()=>submitProduct()} style={{ 
                        marginTop:'30px',
                        width:'100%',
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} >경매 등록</button>
        </div>
        </div>
    );
}

export default AuctionSell;
