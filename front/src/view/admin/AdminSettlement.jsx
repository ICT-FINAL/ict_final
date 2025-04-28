import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

function AdminSettlement() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const [sellers, setSellers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedCount, setSelectedCount] = useState(0);
    const [totalPage, setTotalPage] = useState({ readable: 1 });
    const [pageNumber, setPageNumber] = useState({ readable: [] });
    const [nowPage, setNowPage] = useState({ readable: 1 });
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [searchWord, setSearchWord] = useState("");
    const [expandedUser, setExpandedUser] = useState(null);
    const [productLists, setProductLists] = useState({});

    const fetchUsers = async ({ year = "", month = "", keyword = "", page = 1 }) => {
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getSellersSettlement`, {
                params: { year, month, keyword, page },
                headers: { Authorization: `Bearer ${user.token}` },
            });
            console.log("셀러 정보 : ", res.data);
            setSellers(res.data.sellers);
            setTotalCount(res.data.totalCount);
            setSelectedCount(res.data.selectedCount);

            const total = res.data.totalPage || 1;
            setTotalPage(prev => ({ ...prev, readable: total }));
            const pages = Array.from({ length: total }, (_, i) => i + 1);
            setPageNumber(prev => ({ ...prev, readable: pages }));
        } catch (err) {
            console.error("정산 정보 불러오기 실패", err);
        }
    };

    const handleExpand = async (user_id) => {
        setExpandedUser(prev => prev === user_id ? null : user_id);
        if (productLists[user_id]) return;
        setProductLists(prev => ({
            ...prev,
            [user_id]: { loading: true, error: null, products: [] }
        }));
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getSellerSoldProducts`, {
                params: { user_id, shippingState: "FINISH", year, month },
                headers: { Authorization: `Bearer ${user.token}` }
            });
            console.log("셀러 판매 내역:", res.data);
            setProductLists(prev => ({
                ...prev,
                [user_id]: { loading: false, error: null, products: res.data.orderList }
            }));
        } catch (error) {
            setProductLists(prev => ({
                ...prev,
                [user_id]: { loading: false, error: "데이터 불러오기 실패" }
            }));
        }
    };

    const handleSettlement = async (user_id) => {
        if (!window.confirm("해당 셀러의 주문을 정산 처리하시겠습니까?")) return;
        try {
            const response = await fetch(`${serverIP.ip}/admin/settlement`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ user_id }),

            });

            if (!response.ok) throw new Error("정산 실패");

            alert("정산 완료되었습니다.");

            setSellers(prev =>
                prev.map(seller =>
                    seller.user_id === user_id
                        ? { ...seller, settled: true }
                        : seller
                )
            );
        } catch (error) {
            alert("정산 처리 중 오류 발생");
            console.error(error);
        }
    };



    const inputStyle = {
        width: "140px",
        padding: "7px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
        marginRight: "10px",
    };
    const inputStyle2 = {
        width: "200px",
        padding: "8px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
    };



    useEffect(() => {
        fetchUsers({
            year: "",
            month: "",
            keyword: "",
            page: nowPage.readable,
        });
    }, []);

    useEffect(() => {
        fetchUsers({
            year: year,
            month: month,
            keyword: searchWord,
            page: nowPage.readable
        });
    }, [nowPage.readable]);


    const handleSearch = () => {
        setNowPage(prev => ({ ...prev, readable: 1 }));
        fetchUsers({
            year: year,
            month: month,
            keyword: searchWord,
            page: 1
        });
    };

    const formatNumberWithCommas = (number) => {
        if (number === undefined || number === null) {
            return "0";
        }
        return number.toLocaleString();
    };

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="report-box">
                <span style={{ fontSize: "17px", fontWeight: "600", color: "#555" }}>
                    💰정산 목록
                </span>
                <div className="report-search">
                    <div>
                        분류된 대상자 수 : <strong>{selectedCount}명</strong><br /><hr />
                    </div>
                    <div>
                        <select style={inputStyle} onChange={(e) => setYear(e.target.value)} value={year}>
                            <option value="전체">전체 년도</option>
                            <option value="2025">2025년</option>
                            <option value="2026">2026년</option>
                            <option value="2027">2027년</option>
                            <option value="2028">2028년</option>
                        </select>
                        <select style={inputStyle} onChange={(e) => setMonth(e.target.value)} value={month}>
                            <option value="전체">전체 월</option>
                            <option value="1">1월</option>
                            <option value="2">2월</option>
                            <option value="3">3월</option>
                            <option value="4">4월</option>
                            <option value="5">5월</option>
                            <option value="6">6월</option>
                            <option value="7">7월</option>
                            <option value="8">8월</option>
                            <option value="9">9월</option>
                            <option value="10">10월</option>
                            <option value="11">11월</option>
                            <option value="12">12월</option>
                        </select>
                        <input
                            style={inputStyle2}
                            value={searchWord}
                            onChange={(e) => setSearchWord(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                            placeholder="아이디/판매자 이름"
                        />
                    </div>
                </div>

                <ul className="admin-seller-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                    <li>번호</li>
                    <li>아이디</li>
                    <li>이름</li>
                    <li>총 판매 금액</li>
                    <li>해당 월 정산 금액</li>
                    <li>정산 완료</li>
                </ul>

                {sellers.map((seller, idx) => (
                    <>
                        <ul key={seller.user_id} className="admin-seller-list">
                            <li>{idx + 1}</li>
                            <li>{seller.user_id}</li>
                            <li className='message-who' id={`mgx-${seller.user_id}`} style={{ cursor: 'pointer' }}>{seller.user_name}</li>
                            <li style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => handleExpand(seller.user_id)}>
                                {formatNumberWithCommas(seller.total_sales)}원
                                {expandedUser === seller.user_id ? ' ▲' : ' ▼'}
                            </li>
                            <li>{formatNumberWithCommas(seller.total_sales * 0.8)}원</li>
                            <li><button style={{ height: '30px', width: '65px' }}
                                disable={seller.settled}
                                onClick={() => handleSettlement(seller.user_id)}
                            >{seller.settled ? '정산 완료' : '정산 전'}</button></li>
                        </ul>
                        {expandedUser === seller.user_id && (
                            <div style={{ background: '#f9f9f9', padding: '10px 30px', }}>
                                {productLists[seller.user_id]?.loading && <div>로딩 중...</div>}
                                {productLists[seller.user_id]?.error && <div style={{ color: 'red' }}>{productLists[seller.user_id].error}</div>}
                                {productLists[seller.user_id]?.products && productLists[seller.user_id].products.length > 0 && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #ccc' }}>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>판매일자</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>제품명</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>가격</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>할인율</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>수량/옵션</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>택배비</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>판매 금액</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productLists[seller.user_id]?.products?.map((product, i) => {
                                                const date = new Date(product.modifiedDate);
                                                const year = String(date.getFullYear()).slice(-2);
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
                                                const shippingPrice = product.shippingFee;

                                                return product.orderItems?.map((item, j) => (
                                                    <tr key={`${i}-${j}`}>
                                                        <td style={{ textAlign: 'center', padding: '4px' }}>{formattedDate}</td>
                                                        <td style={{ textAlign: 'center', padding: '4px' }}>{product.product.productName}</td>
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>{formatNumberWithCommas(item.price + item.additionalFee)}원</td>
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>{product.product.discountRate}%</td>
                                                        <td style={{ textAlign: 'center', padding: '4px' }}>
                                                            {item.quantity}개 / ({item.optionName} - {item.optionCategoryName})
                                                        </td>
                                                        <td style={{ textAlign: 'center', padding: '4px' }}>{j === 0 ? `${formatNumberWithCommas(shippingPrice)}원` : '⬆️묶음배송'}</td>
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>{formatNumberWithCommas((((item.price - (item.price * product.product.discountRate / 100)) + item.additionalFee) * item.quantity) + (j === 0 ? shippingPrice : 0))}원</td>
                                                    </tr>
                                                ));
                                            })}
                                        </tbody>
                                    </table>
                                )}
                                {productLists[seller.user_id]?.products && productLists[seller.user_id].products.length === 0 && !productLists[seller.user_id]?.loading && (
                                    <div>판매 내역이 없습니다.</div>
                                )}
                            </div>
                        )}
                    </>
                ))}

                <ul className="admin-paging">
                    {nowPage.readable > 1 && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable - 1 }))}>
                            <li className="page-num">◀</li>
                        </a>
                    )}
                    {pageNumber.readable.map(pg => (
                        <a className="page-num" onClick={() => setNowPage(prev => ({ ...prev, readable: pg }))} key={pg}>
                            <li className={nowPage.readable === pg ? "page-num active" : "page-num"}>{pg}</li>
                        </a>
                    ))}
                    {nowPage.readable < totalPage.readable && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable + 1 }))}>
                            <li className="page-num">▶</li>
                        </a>
                    )}
                </ul>
            </div>
        </div>

    )
}
export default AdminSettlement;