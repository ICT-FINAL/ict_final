import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { setSearch } from "../store/searchSlice";
import { motion } from 'framer-motion';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HotProduct from "./product/HotProduct";
import RAWProduct from "./product/RAWProduct";

function Main() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleSubMenus, setVisibleSubMenus] = useState(12);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const isFetching = useRef(false);
    const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
    const [ongoingSubMenus, setOngoingSubMenus] = useState([]);
    const [endedSubMenus, setEndedSubMenus] = useState([]);
    let serverIP = useSelector((state) => state.serverIP);
    let dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [event_list, setEvent_list] = useState([]);

    function testfunc() {
        if (user)
            axios.get(`${serverIP.ip}/test`, {
                headers: { Authorization: `Bearer ${user.token}` }, //유저 정보 백에서 쓰고싶으면 이거 넘기기
            })
                .then((res) => console.log(res.data))
                .catch((err) => console.log(err));
    }

    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
    }

    const moveToEvent = (tar) => {
        if (tar.state === 'NOCOUPON') {
            navigate('/event/info', { state: tar });
        }
        else {
            navigate(tar.redirectUrl);
        }
    }

    useEffect(() => {
        console.log("현재 로그인된 사용자:", user);
    }, [user]);

    useEffect(() => {
        const now = new Date();
        axios.get(`${serverIP.ip}/event/getEventList`)
            .then(res => {
                const ongoing = res.data.filter(event => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    return start <= now && now <= end;
                })
                    .map(event => ({
                        ...event,
                        src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                    }));
                setEvent_list(ongoing);
            })
            .catch(err => console.log(err))
    }, [])

    const settings = {
        dots: true,
        infinite: event_list.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: event_list.length > 1,
        centerPadding: event_list.length > 1 ? "20%" : "0",
        autoplay: event_list.length > 1,
        autoplaySpeed: 5000,
        appendDots: (dots) => (
            <div
                style={{
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ul> {dots} </ul>
            </div>
        ),
        dotsClass: 'dots_custom'
    };

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        axios.get(`${serverIP.ip}/submenu/getSubMenuList`)
            .then(res => {
                console.log(res.data);
                const ongoing = res.data.filter(submenu => {
                    const end = new Date(submenu.endDate);
                    return end >= now;
                }).map(submenu => ({
                    ...submenu,
                    src: `${serverIP.ip}/uploads/submenu/${submenu.id}/${submenu.filename}`
                }));

                const ended = res.data.filter(submenu => {
                    const end = new Date(submenu.endDate);
                    return end < now;
                }).map(submenu => ({
                    ...submenu,
                    src: `${serverIP.ip}/uploads/submenu/${submenu.id}/${submenu.filename}`
                }));

                setOngoingSubMenus(ongoing);
                setEndedSubMenus(ended);
            })
            .catch(err => console.log(err));
    }, []);

    const allSubMenus = activeTab === "ongoing" ? ongoingSubMenus : endedSubMenus;

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const filteredSubMenus = allSubMenus.filter((submenu) => {
        const subMenuStart = new Date(submenu.startDate);
        const subMenuEnd = new Date(submenu.endDate);
        const selectedMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const selectedMonthEnd = new Date(currentYear, currentMonth, 0);
        selectedMonthEnd.setHours(23, 59, 59, 999);

        return (subMenuStart <= selectedMonthEnd && subMenuEnd >= selectedMonthStart);
    });

    const visibleList = filteredSubMenus.slice(0, visibleSubMenus);

    useEffect(() => {
        if (inView && visibleSubMenus < filteredSubMenus.length && !isFetching.current) {
            isFetching.current = true;
            setTimeout(() => {
                setVisibleSubMenus(prev => Math.min(prev + 3, filteredSubMenus.length));
                isFetching.current = false;
            }, 500);
        }
    }, [inView, filteredSubMenus]);

    useEffect(() => {
        setVisibleSubMenus(12);
    }, [activeTab, currentMonth, currentYear]);

    const moveSubMenu = (tar) => {
        console.log(tar.subMenuCategory);
        /*
        axios.get(`${serverIP.ip}/submenu/move`)
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
            console.log(err);
        })
            */
        const str = tar.subMenuCategory;

        const result = [];
        const regex = /\[[^\]]*\]|[^,]+/g;
        
        let match;
        while ((match = regex.exec(str)) !== null) {
          result.push(match[0]);
        }

        const cleaned = result.map(item =>
            item.startsWith('[') && item.endsWith(']')
              ? item.slice(1, -1)
              : item
        );
        const [a, b, c] = cleaned;
        let ec='';
        let tc='';
        let cList=[];
        if(a!=='전체') ec=a;  
        if(b!=='전체') tc=b;
        if(c.length > 0)
            cList = c.split(',');
        dispatch(setSearch({searchWord:'',eventCategory:ec,targetCategory:tc, productCategory:cList}));
        navigate('/product/search');
    }

    const { ref: hotRef, inView: isHotInView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
        rootMargin: "0px 0px -200px 0px"
    });

    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isHotInView && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isHotInView, hasAnimated]);

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: 'easeOut',
          },
        },
    };

    const { ref: rawRef, inView: rawInView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
        rootMargin: "0px 0px -200px 0px"
    });
    const [rawAnimated, setRawAnimated] = useState(false);
    
    useEffect(() => {
        if (rawInView && !rawAnimated) {
            setRawAnimated(true);
        }
    }, [rawInView, rawAnimated]);


    return (
        <div style={{ paddingTop: '100px' }}>
            <div className="slider-container">
                <Slider {...settings} className={event_list.length === 1 ? "slick-center" : ""}>
                    {event_list.map((item, idx) => (
                        <div key={idx} className="slider-image-banner">
                            <div className="slider-image-wrapper">
                                <img
                                    className="slider-image"
                                    src={item.src}
                                    alt={item.eventName}
                                />
                                <div className="event-date-badge">
                                    📅 {item.startDate.substring(0, 10)} ~ 📅 {item.endDate.substring(0, 10)}
                                </div>

                                {item.state === "COUPON" && <div className="main-coupon-badge">쿠폰 지급!</div>}

                                <div className="event-button" onClick={() => moveToEvent(item)}>자세히보기 ▶</div>
                            </div>

                        </div>
                    ))}
                </Slider>
            </div>
            <div style={{
                width:'70%',
                minWidth:'1200px',
                maxWidth:'1600px',
                margin:'auto',
                textAlign: 'center',
                marginTop: '0px',
                marginBottom: '60px',
                padding: '40px 20px',
                borderBottom:'1px solid #e0dcd5',
                fontFamily:'Pretendard, san-serif'
            }}>
            <h2 style={{
                fontSize: '32px',
                color: '#222',
                fontWeight: '700',
                marginBottom: '15px',
                letterSpacing: '-0.5px'
            }}>
                🎁 MIMYO 핸드메이드 셀렉션
            </h2>
            <p style={{
                fontSize: '18px',
                color: '#555',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6',
            }}>
                정성과 감성을 담아 만든 핸드메이드 아이템,<br />
                <span style={{ fontWeight: '600', color: '#8CC7A5' }}>
                MIMYO가 이번 달 추천하는 컬렉션
                </span>을 만나보세요.
            </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', textAlign: 'center', justifyContent: 'center', margin: 'auto', width:'800px' }} >
                {visibleList.length > 0 ? (
                    visibleList.map((submenu) => (
                        <div onClick={() => moveSubMenu(submenu)} key={submenu.id}
                            style={{ padding: '0 10px', width: '100px' }}>
                            <img id="submenu-img" src={submenu.src} alt={submenu.subMenuName}/>
                            <div style={{fontSize: '11pt', padding: '10px 0'}}>{submenu.subMenuName}</div>
                        </div>
                    ))
                ) : (
                    <></>
                )}
            </div>
            <motion.div
                className='hot-product-container'
                ref={hotRef}
                initial="hidden"
                animate={hasAnimated ? 'visible' : 'hidden'}
                variants={fadeUp}
            >
                <HotProduct/>
            </motion.div>
            <motion.div
                className='raw-container'
                ref={rawRef}
                initial="hidden"
                animate={rawAnimated ? 'visible' : 'hidden'}
                variants={fadeUp}
            >
                <RAWProduct/>
            </motion.div>
            <div style={{
                width:'70%',
                margin:'auto',
                textAlign: 'center',
                marginTop: '80px',
                marginBottom: '60px',
                padding: '40px 20px',
                fontFamily:'Pretendard, san-serif'
            }}>
            <h2 style={{
                fontSize: '32px',
                color: '#222',
                fontWeight: '700',
                marginBottom: '15px',
                letterSpacing: '-0.5px'
            }}>
                이 달의 MIMYO 인기 작가💕💕 
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
                손끝에서 피어나는 감성,
                <span style={{ fontWeight: '600', color: '#8CC7A5' }}>
                이번 달 가장 주목받는 MIMYO 작가</span>들을 소개합니다 🌿
            </p>
            </div>
        </div>
    );
}

export default Main;