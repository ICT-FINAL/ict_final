import { useState,useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function ProductSell() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [formData, setFormData] = useState({
        productName: "",
        eventCategory: "",
        targetCategory: "",
        productCategory: "",
        subCategories: "",
        detail: "",
        price: "",
        quantity: "",
        discountRate: "",
        options: []
    });
    
    const addMainOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { mainOptionName: "", quantity: 0, subOptions: [] }]
        }));
    };

    const removeMainOption = (index) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleMainOptionChange = (index, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index].mainOptionName = value;
        setFormData({ ...formData, options: updatedOptions });
    };

    const calculateTotalQuantity = () => {
        let totalQuantity = 0;
    
        formData.options.forEach(option => {
            option.subOptions.forEach(subOption => {
                totalQuantity += subOption.quantity;
            });
        });
        return totalQuantity;
    };

    const addSubOption = (index) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index].subOptions.push({ subOptionName: "", quantity: 1 });
        setFormData({ ...formData, options: updatedOptions });
    };

    const removeSubOption = (mainIndex, subIndex) => {
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions = updatedOptions[mainIndex].subOptions.filter((_, i) => i !== subIndex);
        setFormData({ ...formData, options: updatedOptions });
    };

    const handleSubOptionChange = (mainIndex, subIndex, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions[subIndex].subOptionName = value;
        setFormData({ ...formData, options: updatedOptions });
    };

    const handleSubOptionQuantityChange = (mainIndex, subIndex, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions[subIndex].quantity = parseInt(value, 10) || 0;
        setFormData({ ...formData, options: updatedOptions });
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
        setFormData({ ...formData, [name]: value });
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
        setFormData(prev => ({
            ...prev,
            subCategories: sub
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

    const submitProduct = () => {
        let new_formData = new FormData();
    
        for (let i = 0; i < files.length; i++) {
            new_formData.append("files", files[i]);
        }

        const productData = {
            productName: formData.productName,
            eventCategory: formData.eventCategory,
            targetCategory: formData.targetCategory,
            productCategory: formData.subCategories,
            detail: formData.detail,
            price: parseInt(formData.price, 10) || 0,
            quantity: formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity,
            discountRate: parseFloat(formData.discountRate) || 0.0,
            options: formData.options.map(option => ({
              mainOptionName: option.mainOptionName,
              quantity: option.quantity,
              subOptions: option.subOptions.map(subOption => ({
                subOptionName: subOption.subOptionName,
                quantity: subOption.quantity,
              })),
            })),
          };

          new_formData.append("product", new Blob([JSON.stringify(productData)], {
            type: "application/json"
          }));
          console.log(productData);
          
        axios.post(`${serverIP.ip}/product/write`, new_formData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            console.log("상품 등록 성공:", res.data);
        })
        .catch(err => console.error("상품 등록 실패:", err));
    };

    return (
        <div style={{paddingTop:'100px'}}>
        <div className="product-form-container">
            <h2 className="product-form-title">상품 등록</h2>

            <fieldset className="product-fieldset">
                <legend className="product-legend">기본 정보</legend>
                <label className="product-label">상품명</label>
                <input type="text" name="productName" className="product-input" value={formData.productName} onChange={handleChange} />
            </fieldset>

            <fieldset className="product-fieldset">
                <legend className="product-legend">카테고리 선택</legend>
                <label className="product-label">이벤트</label>
                <select name="eventCategory" className="product-select" value={formData.eventCategory} onChange={handleChange}>
                    <option value="">선택</option>
                    {eventOptions.map((event) => (
                        <option key={event} value={event}>{event}</option>
                    ))}
                </select>

                <label className="product-label">대상</label>
                <select name="targetCategory" className="product-select" value={formData.targetCategory} onChange={handleChange}>
                    <option value="">선택</option>
                    {targetOptions.map((target) => (
                        <option key={target} value={target}>{target}</option>
                    ))}
                </select>

                <label className="product-label">상품 카테고리</label>
                <select name="productCategory" className="product-select" value={formData.productCategory} onChange={handleCategoryChange}>
                    <option value="">선택</option>
                    {Object.keys(productOptions).map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                {formData.productCategory && productOptions[formData.productCategory] && (
                    <div className="product-checkbox-group">
                        <strong>세부 카테고리 선택</strong>
                        {productOptions[formData.productCategory].map((sub) => (
                            <label key={sub} className="product-checkbox-label">
                                <input
                                    type="radio"
                                    name="subCategories"
                                    value={sub}
                                    checked={formData.subCategories === sub}
                                    onChange={() => handleSubCategoryChange(sub)}
                                />
                                {sub}
                            </label>
                        ))}
                    </div>
                )}

                {formData.subCategories && (
                        <>
                            <button type="button" onClick={addMainOption}>옵션 추가</button>
                            <div>
                                {formData.options.map((option, mainIndex) => (
                                    <div key={mainIndex} style={{ marginBottom: "15px" }}>
                                        <input
                                            type="text"
                                            value={option.optionName}
                                            onChange={(e) => handleMainOptionChange(mainIndex, e.target.value)}
                                            placeholder="대분류 옵션 이름 입력"
                                        />

                                        <button type="button" onClick={() => addSubOption(mainIndex)}>+ 소분류 옵션 추가</button>
                                        <button type="button" onClick={() => removeMainOption(mainIndex)}>대분류 삭제</button>
                                        <div style={{ marginLeft: "20px" }}>
                                            {option.subOptions.map((subOption, subIndex) => (
                                                <div key={subIndex}>
                                                    <input
                                                        type="text"
                                                        value={subOption.subOptionName}
                                                        onChange={(e) => handleSubOptionChange(mainIndex, subIndex, e.target.value)}
                                                        placeholder="소분류 옵션 이름"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={subOption.quantity}
                                                        onChange={(e) => handleSubOptionQuantityChange(mainIndex, subIndex, e.target.value)}
                                                        placeholder="수량"
                                                        min="1"
                                                    />
                                                     <button type="button" onClick={() => removeSubOption(mainIndex, subIndex)}>소분류 삭제</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
            </fieldset>

            <fieldset className="product-fieldset">
                <legend className="product-legend">상세 정보</legend>
                <label className="product-label">상세 설명</label>
                <textarea name="detail" className="product-textarea" value={formData.detail} onChange={handleChange} rows="4"></textarea>

                <label className="product-label">가격</label>
                <input type="text" name="price" className="product-input" value={formData.price} onChange={handleChange} />

                <label className="product-label">수량</label>
                <input
                        type="number"
                        name="quantity"
                        className="product-input"
                        value={formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity}
                        readOnly={formData.options.length > 0}
                        onChange={handleChange}
                    />
                <label className="product-label">할인율</label>
                <input type="text" name="discountRate" className="product-input" value={formData.discountRate} onChange={handleChange} />
            </fieldset>

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
                    }} >상품 등록</button>
        </div>
        </div>
    );
}

export default ProductSell;
