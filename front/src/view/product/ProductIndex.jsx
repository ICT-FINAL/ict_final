import { setSearch } from "../../store/searchSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ProductIndex(){

    const search = useSelector((state => state.search));
    const [searchWord, setSearchWord] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeSearchWord = (e) => {
        setSearchWord(e.target.value);
    }

    const doSearch = () => {
        dispatch(setSearch({...search, searchWord:searchWord}));
        navigate('/product/search');
    }
    const doSell = () => {
        navigate('/product/sell');
    }
    return(
        <div style={{padding:'200px'}}>
            상품메인페이지<br/>
            <input type='text' onChange={changeSearchWord}/>
            <button onClick={doSearch}>검색</button> <br/>
            <button onClick={doSell}>상품 등록</button>
        </div>
    )
}

export default ProductIndex;