import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SubMenuIndex() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleSubMenus, setVisibleSubMenus] = useState(5);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1월=1, 12월=12
    const isFetching = useRef(false);
    const navigate = useNavigate();
    const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);
    const [ongoingSubMenus, setOngoingSubMenus] = useState([]);
    const [endedSubMenus, setEndedSubMenus] = useState([]);

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        axios.get(`${serverIP.ip}/submenu/getSubMenuList`, {
            headers: { Authorization: `Bearer ${user.token}` },
        })
            .then(res => {
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
        setVisibleSubMenus(5);
    }, [activeTab, currentMonth, currentYear]);

    const moveSubMenu = (tar) => {
        // if (tar.state === 'NOCOUPON') {
        //     navigate('/submenu/info', { state: tar });
        // } else {
        //     navigate(tar.redirectUrl);
        // }
    }

    return (
        <div className="event-container">
            <div className="calendar-nav">
                <button onClick={() => handlePrevMonth()} className="arrow-button">
                    ‹ {currentMonth === 1 ? currentYear - 1 : currentYear}.{currentMonth === 1 ? 12 : currentMonth - 1}
                </button>
                <span>
                    {currentYear}.{currentMonth.toString().padStart(2, "0")}
                </span>
                <button onClick={() => handleNextMonth()} className="arrow-button">
                    {currentMonth === 12 ? currentYear + 1 : currentYear}.{currentMonth === 12 ? 1 : currentMonth + 1} ›
                </button>
            </div>

            <div className="tab-menu">
                <button onClick={() => setActiveTab("ongoing")} className={activeTab === "ongoing" ? "active" : ""}>
                    진행중인 서브메뉴
                </button>
                <button onClick={() => setActiveTab("ended")} className={activeTab === "ended" ? "active" : ""}>
                    완료된 서브메뉴
                </button>
                {user && user.user.authority === "ROLE_ADMIN" && (
                    <button onClick={() => navigate("/submenu/write")}>서브메뉴만들기</button>
                )}
            </div>
            <div className="event-list">
                <h2>❇️서브메뉴 리스트</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', textAlign: 'center', justifyContent: 'flex-start' }} >
                    {visibleList.length > 0 ? (
                        visibleList.map((submenu) => (
                            <div onClick={() => moveSubMenu(submenu)} key={submenu.id} style={{ width: 'calc(22%)' }}>
                                <img src={submenu.src} alt={submenu.subMenuName} />
                                <div>{submenu.subMenuName}</div>
                                <div>📅 {submenu.startDate.substring(0, 10)} ~ 📅 {submenu.endDate.substring(0, 10)}</div>
                                <div></div>
                            </div>
                        ))
                    ) : (
                        <div className="no-events">📌 해당 월에는 서브메뉴가 없습니다.</div>
                    )}
                </div>
            </div>
            <div ref={ref} className="loading-trigger"></div>
        </div >
    );
}
export default SubMenuIndex;
