import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

function AdminEdit() {
    const loc = useLocation();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedTotalCount, setSelectedTotalCount] = useState(0);
    const [totalPage, setTotalPage] = useState({ readable: 1 });
    const [pageNumber, setPageNumber] = useState({ readable: [] });
    const [nowPage, setNowPage] = useState({ readable: 1 });
    const [category, setCategory] = useState("전체");
    const [searchWord, setSearchWord] = useState("");

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

    const fetchUsers = async ({ page = 1, keyword = "", authority = "전체" }) => {
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getUsers`, {
                params: { page, keyword, authority },
                headers: { Authorization: `Bearer ${user.token}` },
            });
            console.log("보내는 데이터!!!", searchWord, category);
            setUsers(res.data.users);
            setTotalCount(res.data.totalCount);
            setSelectedTotalCount(res.data.selectedTotalCount);

            const total = res.data.totalPage || 1;
            setTotalPage(prev => ({ ...prev, readable: total }));
            const pages = Array.from({ length: total }, (_, i) => i + 1);
            setPageNumber(prev => ({ ...prev, readable: pages }));
        } catch (err) {
            console.error("회원 정보 불러오기 실패", err);
        }
    };

    useEffect(() => {
        fetchUsers({
            page: nowPage.readable,
            keyword: "",
            authority: "전체"
        });
    }, []);


    useEffect(() => {
        fetchUsers({
            page: nowPage.readable,
            keyword: searchWord,
            authority: category,
        });
    }, [nowPage.readable]);


    const handleSearch = () => {
        setNowPage(prev => ({ ...prev, readable: 1 }));
        fetchUsers({
            page: 1,
            keyword: searchWord,
            authority: category,
        });
    };

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="report-box">
                <span style={{ fontSize: "17px", fontWeight: "600", color: "#555" }}>
                    🔍회원 목록
                </span>
                <div className="report-search">
                    <div>
                        총 사용자 수 : <strong>{totalCount}명</strong><br /><hr />
                        분류된 사용자 수 : <strong>{selectedTotalCount}명</strong>
                    </div>
                    <div>
                        <select style={inputStyle} onChange={(e) => setCategory(e.target.value)} value={category}>
                            <option value="전체">전체</option>
                            <option value="관리자">관리자</option>
                            <option value="사용자">사용자</option>
                            <option value="사용 정지">사용 정지(아직안됨)</option>
                            <option value="탈퇴">탈퇴(아직안됨)</option>
                            <option value="강퇴">강퇴(아직안됨)</option>
                        </select>
                        <input
                            style={inputStyle2}
                            value={searchWord}
                            onChange={(e) => setSearchWord(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                            placeholder="아이디/사용자 이름"
                        />
                    </div>
                </div>

                <ul className="admin-user-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                    <li>번호</li>
                    <li>분류</li>
                    <li>아이디</li>
                    <li>이름</li>
                    <li>주소</li>
                    <li>전화 번호</li>
                </ul>

                {users.map((user, idx) => (
                    <ul key={user.id} className="admin-user-list">
                        <li>{idx + 1}</li>
                        <li>{user.authority}</li>
                        <li>{user.userid}</li>
                        <li>{user.username}</li>
                        <li>{user.address}</li>
                        <li>{user.tel}</li>
                    </ul>
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
    );
}

export default AdminEdit;


// import { useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";

// function AdminEdit() {
//     const loc = useLocation();
//     const serverIP = useSelector((state) => { return state.serverIP });
//     const user = useSelector((state) => state.auth.user);

//     const [users, setUsers] = useState([]);
//     const [totalCount, setTotalCount] = useState(0);

//     const [totalPage, setTotalPage] = useState({
//         readable: 1, processing: 1, complete: 1
//     });
//     const [pageNumber, setPageNumber] = useState({
//         readable: [], processing: [], complete: []
//     });
//     const [nowPage, setNowPage] = useState({
//         readable: 1, processing: 1, complete: 1
//     })

//     const [totalRecord, setTotalRecord] = useState({
//         readable: 1, processing: 1, complete: 1
//     })

//     const [category, setCategory] = useState('전체'); // 초기값을 '전체'로 설정
//     const [searchWord, setSearchWord] = useState('');

//     const changeCat = (e) => {
//         setCategory(e.target.value);
//     }

//     const changeSearchWord = (e) => {
//         setSearchWord(e.target.value);
//     }

//     const inputStyle = {
//         width: '140px',
//         padding: '7px',
//         borderRadius: '5px',
//         border: '1px solid #ccc',
//         fontSize: '14px',
//         marginRight: '10px'
//     };
//     const inputStyle2 = {
//         width: '200px',
//         padding: '8px',
//         borderRadius: '5px',
//         border: '1px solid #ccc',
//         fontSize: '14px',
//     };

//     const fetchUsers = async (params = {}) => {
//         try {
//             const res = await axios.get(${serverIP.ip}/admin/getUsers, {
//                 params: params,
//                 headers: { Authorization: Bearer ${user.token} }
//             });
//             setUsers(res.data.users);
//             setTotalCount(res.data.total);
//         } catch (err) {
//             console.error('회원 정보 불러오기 실패', err);
//         }
//     };

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     const handleSearch = () => {
//         axios.get(${serverIP.ip}/admin/getUsers, {
//             params: {
//                 keyword: searchWord,
//                 authority: category
//             },
//             headers: { Authorization: Bearer ${user.token} }
//         })
//             .then(res => {
//                 console.log("보내는 데이터!!!", searchWord, category);
//                 setUsers(res.data.users);
//             })
//             .catch(err => {
//                 console.error('검색 실패', err);
//             });
//     };

//     return (
//         <div style={{ paddingLeft: '10px' }}>
//             <div className='report-box'>
//                 <span style={{ paddingLeft: '0px', fontSize: '17px', fontWeight: '600', color: '#555' }}>🔍회원 목록</span>
//                 <div className='report-search'>
//                     <div>총 가입자 수: <strong>{totalCount}명</strong></div>
//                     <div><select style={inputStyle} onChange={changeCat} value={category}>
//                         <option value="전체">전체</option>
//                         <option value="관리자">관리자</option>
//                         <option value="사용자">사용자</option>
//                         <option value="사용 정지">사용 정지</option>
//                         <option value="탈퇴">탈퇴</option>
//                         <option value="강퇴">강퇴</option>
//                     </select><input
//                             style={inputStyle2}
//                             value={searchWord}
//                             onChange={changeSearchWord}
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter') {
//                                     handleSearch();
//                                 }
//                             }}
//                             placeholder="아이디/사용자 이름"
//                         />
//                     </div>
//                 </div>
//                 <ul className='admin-user-list' style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
//                     <li>
//                         번호
//                     </li>
//                     <li>
//                         분류
//                     </li>
//                     <li>
//                         아이디
//                     </li>
//                     <li>
//                         이름
//                     </li>
//                     <li>
//                         주소
//                     </li>
//                     <li>
//                         전화 번호
//                     </li>
//                 </ul>

//                 {users.map((user, idx) => (
//                     <ul key={user.id} className='admin-user-list'>
//                         <li>{idx + 1}</li>
//                         <li>{user.authority}</li>
//                         <li>{user.userid}</li>
//                         <li>{user.username}</li>
//                         <li>{user.address}</li>
//                         <li>{user.tel}</li>
//                     </ul>
//                 ))}
//                 <ul className="admin-paging">
//                     {nowPage.readable > 1 && (
//                         <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable - 1 }))}>
//                             <li className="page-num">◀</li>
//                         </a>
//                     )}
//                     {pageNumber.readable.map((pg) => {
//                         const activeStyle = nowPage.readable === pg ? 'page-num active' : 'page-num';
//                         return (
//                             <a className="page-num" onClick={() => setNowPage(prev => ({ ...prev, readable: pg }))} key={pg}>
//                                 <li className={activeStyle}>{pg}</li>
//                             </a>
//                         );
//                     })}
//                     {nowPage.readable < totalPage.readable && (
//                         <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable + 1 }))}>
//                             <li className="page-num">▶</li>
//                         </a>
//                     )}
//                 </ul>
//             </div>
//         </div>
//     );
// }
// export default AdminEdit;