import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { setLoginView } from "../store/loginSlice";

import { motion } from "framer-motion";
import Logo from '../img/mimyo_logo-removebg.png';
import Login from "./user/Login";

function Header() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const user = useSelector((state) => state.auth.user);
    const loginView = useSelector((state)=> state.loginView);
    const dispatch = useDispatch();
    const menuButtonRef = useRef(null);
    const menuRef = useRef(null);
    let serverIP = useSelector((state) => state.serverIP);
    const [messageCount, setMessageCount] = useState(3);

    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
        window.location.href='/';
    }

    useEffect(() => {
        function updateMenuPosition() {
            if (menuButtonRef.current) {
                const rect = menuButtonRef.current.getBoundingClientRect();
                setMenuPosition({ 
                    top: rect.bottom + 5,
                    left: rect.left + window.scrollX
                });
            }
        }
    
        if (isMenuOpen) {
            updateMenuPosition();
            window.addEventListener("resize", updateMenuPosition);
        }
    
        return () => {
            window.removeEventListener("resize", updateMenuPosition);
        };
    }, [isMenuOpen]);

    return (
        <div className='header-container'>
            <ul className='header-nav'>
                <li className='header-left'>
                    <Link to='/'>
                        <img src={Logo} width='100' className="header-logo"/>
                    </Link>
                </li>

                <li className='header-center'>
                    <ul>
                        <Link to='/'><li>메뉴입니다 1</li></Link>
                        <Link to='/'><li>메뉴입니다 2</li></Link>
                        <Link to='/'><li>메뉴 3</li></Link>
                        <Link to='/'><li>메뉴임 1</li></Link>
                    </ul>
                </li>

                <li className='header-right'>
                    {user ? (
                        <>
                            <div ref={menuButtonRef} className="menu-icon" onClick={() => setMenuOpen(!isMenuOpen)}>
                                <img src = {user.user.imgUrl.indexOf('http') !==-1 ? `${user.user.imgUrl}`:`${serverIP.ip}${user.user.imgUrl}`} alt='' width={40} height={40} style={{borderRadius:'100%', backgroundColor:'white'}}/>
                                <div style={{color:'white', paddingLeft:'10px', textAlign:'center', width:'120px', fontSize:'14px',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{user.user.username}<br/><div style={{paddingTop:'5px'}}>P:1000p / G:👑</div></div>
                            </div>
                        </>
                    ) : (
                        <div className="login-btn" onClick={() => dispatch(setLoginView(true))}>로그인</div>
                    )}
                    <div className='header-search-box'>
                        <svg style={{paddingLeft:'10px'}} className='search-icon' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2"/>
                            <line x1="15" y1="15" x2="22" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <input type='text' className="search-input" placeholder="검색어를 입력해주세요"/>
                    </div>
                </li>
            </ul>

            <motion.div
                ref={menuRef}
                className={`dropdown-menu ${isMenuOpen ? "show" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isMenuOpen ? 1 : 0 }}
                style={{ top: `${menuPosition.top+10}px`, left: `${menuPosition.left}px` }}
            >
                <div className="menu-grid">
                    <div className="menu-item">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="white" strokeWidth="2"/>
                        </svg>
                        <span>내 정보</span>
                    </div>

                    <div className="menu-item">
                        <svg transform="translate(-3,0)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6h15l-2 9H8L6 6z" stroke="white" strokeWidth="2"/>
                            <circle cx="9" cy="20" r="1.5" fill="white"/>
                            <circle cx="17" cy="20" r="1.5" fill="white"/>
                        </svg>
                        <span>장바구니</span>
                    </div>

                    <div className="menu-item">
                    <div className="icon-container">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4h16v14H4z" stroke="white" strokeWidth="2"/>
                            <path d="M4 4l8 7 8-7" stroke="white" strokeWidth="2"/>
                        </svg>
                        {messageCount > 0 && <span className="badge">{messageCount}</span>}
                    </div>
                        <span>쪽지</span>
                    </div>

                    <div className="menu-item" onClick={handleLogout}>
                        <svg transform="translate(2,-4)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h10v18H3" stroke="white" strokeWidth="2"/>
                            <path d="M17 16l4-4m0 0l-4-4m4 4H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>로그아웃</span>
                    </div>
                </div>
            </motion.div>

            <div className={`login-wrapper ${loginView ? 'show' : ''}`}>
                <Login onClose={() => dispatch(setLoginView(false))} />
            </div>
        </div>
    );
}

export default Header;