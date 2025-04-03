function MyBasket(){
    return(
        <div style={{paddingLeft:'10px'}}>
            <div className='basket-addr' style={{borderBottom:'2px solid #555'}}>
                <span style={{paddingLeft:'0px', fontSize:'17px', fontWeight:'600',color:'#555'}}> 🏡 배송지 : <button>변경</button></span>
            </div>
            <div className="basket-sel-all">
                <input type="checkbox"/> 전체 선택  <button type="button">선택삭제</button>
            </div>
            <div className="basket-body">
                <input type="checkbox"/>ict네 코딩 고추장 가게 🛖 <button type="button">쿠폰받기</button>
            <ul className='admin-list' style={{fontWeight:'bold', borderBottom:'1px solid #ddd'}}>
                <li>
                    번호
                </li>
                <li>
                    판매자
                </li>
                <li>
                    제품  
                </li>
                <li>
                    가격
                </li>
                <li>
                    배송비
                </li>
            </ul>
            </div>
        </div>
    )
}
export default MyBasket;