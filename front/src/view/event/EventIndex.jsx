import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function EventIndex() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleEvents, setVisibleEvents] = useState(3);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1월=1, 12월=12
    const isFetching = useRef(false);
    const navigate = useNavigate();
    const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const [endedEvents, setEndedEvents] = useState([]);

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
    
        axios.get(`${serverIP.ip}/event/getEventList`)
            .then(res => {
                const ongoing = res.data.filter(event => {
                    const end = new Date(event.endDate);
                    return end >= now;
                }).map(event => ({
                    ...event,
                    src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                }));
    
                const ended = res.data.filter(event => {
                    const end = new Date(event.endDate);
                    return end < now;
                }).map(event => ({
                    ...event,
                    src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                }));
    
                setOngoingEvents(ongoing);
                setEndedEvents(ended);
            })
            .catch(err => console.log(err));
    }, []);

    const allEvents = activeTab === "ongoing" ? ongoingEvents : endedEvents;

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

    const filteredEvents = allEvents.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const selectedMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const selectedMonthEnd = new Date(currentYear, currentMonth, 0);
        selectedMonthEnd.setHours(23, 59, 59, 999);
    
        return (eventStart <= selectedMonthEnd && eventEnd >= selectedMonthStart);
    });

    const visibleList = filteredEvents.slice(0, visibleEvents);

    useEffect(() => {
        if (inView && visibleEvents < filteredEvents.length && !isFetching.current) {
            isFetching.current = true;
            setTimeout(() => {
                setVisibleEvents(prev => Math.min(prev + 3, filteredEvents.length));
                isFetching.current = false;
            }, 500);
        }
    }, [inView, filteredEvents]);

    useEffect(() => {
        setVisibleEvents(3);
    }, [activeTab, currentMonth, currentYear]);

    const moveEvent = (tar) => {
        if (tar.state === 'NOCOUPON') {
            navigate('/event/info', { state: tar });
        } else {
            navigate(tar.redirectUrl);
        }
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
                    진행 중 이벤트
                </button>
                <button onClick={() => setActiveTab("ended")} className={activeTab === "ended" ? "active" : ""}>
                    완료된 이벤트
                </button>
                {user && user.user.authority === "ROLE_ADMIN" && (
                    <button onClick={() => navigate("/event/write")}>글쓰기</button>
                )}
            </div>

            <div className="event-list">
                {visibleList.length > 0 ? (
                    visibleList.map((event) => (
                        <div onClick={() => moveEvent(event)} className={`event-banner ${activeTab === "ended" ? "ended" : ""}`} key={event.id}>
                            <img src={event.src} alt={event.eventName} />
                            <div className="event-date">📅 {event.startDate.substring(0, 10)} ~ 📅 {event.endDate.substring(0, 10)}</div>
                            <div className="event-title">{event.eventName}</div>
                            {event.state === "COUPON" && <div className="coupon-badge">쿠폰 지급!</div>}
                        </div>
                    ))
                ) : (
                    <div className="no-events">📌 해당 월에는 이벤트가 없습니다.</div>
                )}
            </div>

            <div ref={ref} className="loading-trigger"></div>
        </div>
    );
}

export default EventIndex;
