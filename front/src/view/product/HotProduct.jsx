import { useEffect } from 'react';
import '../../css/view/hotproduct.css';

function HotProduct(){
    useEffect(()=>{
        console.log('hi');
    },[]);
    return(
        <div className="hot-product-container">
            <strong className='hot-title'>오늘의 미묘 카테고리</strong>
            <div className='hot-list'>

            </div>
        </div>
    );
}

export default HotProduct;