import { setSearch } from "../../store/searchSlice";
import { useSelector, useDispatch } from "react-redux";

function ProductSearch(){

    const search = useSelector((state => state.search));
    const dispatch = useDispatch();

    return(
        <div style={{padding:'200px'}}>
            상품검색페이지<br/>
            '{search.searchWord}' 에 대한 검색 결과
        </div>
    )
}

export default ProductSearch;