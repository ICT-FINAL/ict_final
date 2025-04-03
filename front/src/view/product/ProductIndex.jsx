import { setSearch } from "../../store/searchSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setModal } from "../../store/modalSlice";
import CategoryModal from "../../modal/CategoryModal";


function ProductIndex(){

    const search = useSelector((state => state.search));
    const [searchWord, setSearchWord] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* 상품 검색 카테고리 */
    const [selectedSubCategories, setSelectedSubCategories] = useState([]); // 소분류값들을 저장한 배열

    // 모달에서 선택된 데이터를 받는 함수
    const handleCategorySelect = (selectedData) => {
        setSelectedSubCategories(selectedData);
    };

    const [eventCategory, setEventCategory] = useState("");
    const [targetCategory, setTargetCategory] = useState("");
    // const [productCategory, setProductCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");

    const modal = useSelector((state)=>state.modal);

    const changeSearchWord = (e) => {
        setSearchWord(e.target.value);
    }
    
    const doSearch = () => {
        dispatch(setSearch({...search, 
            searchWord:searchWord,
            eventCategory:eventCategory,
            targetCategory:targetCategory,
            productCategory:subCategory
        }));
        navigate('/product/search');
    }

    const doSell = () => {
        navigate('/product/sell');
    }
    
    /* 상품 검색 카테고리 */
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


    return(
        <div style={{ padding: '200px' }}>
            <h2>상품 메인 페이지</h2>
            <div>
                <select onChange={(e) => setEventCategory(e.target.value)} className="selectbox-style"> 
                    <option value="">이벤트 선택</option>
                    {eventOptions.map((event, index) => (
                        <option key={index} value={event}>{event}</option>
                    ))}
                </select>
                
                <select onChange={(e) => setTargetCategory(e.target.value)} className="selectbox-style"> 
                    <option value="">대상 선택</option>
                    {targetOptions.map((target, index) => (
                        <option key={index} value={target}>{target}</option>
                    ))}
                </select>

                <button onClick={() => dispatch(setModal({
    ...modal,
    isOpen: true,
    selected: "categorymodal",
    info: productOptions,
    onSelect: handleCategorySelect // 부모에서 handleCategorySelect 실행
}))} className="selectbox-style">
    카테고리 선택
</button>
            </div>
            
            <input type="text" placeholder="검색어 입력" onChange={changeSearchWord} className="searchWord-style"/>
            <button onClick={doSearch} className="searchBtn-style">검색</button> <br />
            <button onClick={doSell}>상품 등록</button>

            {/* 선택된 카테고리 표시 */}
            <p>선택된 소분류: {selectedSubCategories.join('/ ')}</p>

        </div>
    )
}

export default ProductIndex;