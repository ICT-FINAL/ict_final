import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import testImg from './event_test.jpg';
import testEndImg from './event_end_test.jpg';
function EventIndex() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleEvents, setVisibleEvents] = useState(3);
    const isFetching = useRef(false);
    const navigate = useNavigate();

    const { ref, inView } = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    const user = useSelector((state) => state.auth.user);

    const ongoingEvents = [
        { id: 1, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트1", src: testImg, state:'COUPON' },
        { id: 2, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트2", src: testImg, state:'NOCOUPON' },
        { id: 3, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트3", src: testImg, state:'COUPON' },
        { id: 4, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트4", src: testImg, state:'NOCOUPON'  },
        { id: 5, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트5", src: testImg, state:'NOCOUPON'  },
        { id: 6, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트6", src: testImg, state:'NOCOUPON'  },
        { id: 7, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트7", src: testImg, state:'COUPON' },
        { id: 8, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트8", src: testImg, state:'NOCOUPON'  },
    ];

    const endedEvents = [
        { id: 1, startDate: "2025-03-26", endDate: "2025-04-01", eventName: "이벤트1", src:testEndImg, state:'NOCOUPON' },
        { id: 2, startDate: "2025-03-25", endDate: "2025-04-01", eventName: "이벤트2", src:testEndImg, state:'NOCOUPON'  },
        { id: 3, startDate: "2025-03-24", endDate: "2025-04-01", eventName: "이벤트3", src:testEndImg, state:'NOCOUPON'  },
        { id: 4, startDate: "2025-03-23", endDate: "2025-04-01", eventName: "이벤트4", src:testEndImg, state:'NOCOUPON'  },
        { id: 5, startDate: "2025-03-26", endDate: "2025-04-01", eventName: "이벤트5", src:testEndImg, state:'NOCOUPON'  },
        { id: 6, startDate: "2025-03-28", endDate: "2025-04-01", eventName: "이벤트6", src:testEndImg, state:'NOCOUPON'  },
        { id: 7, startDate: "2025-03-26", endDate: "2025-04-01", eventName: "이벤트7", src:testEndImg, state:'COUPON' },
        { id: 8, startDate: "2025-03-21", endDate: "2025-04-01", eventName: "이벤트8", src:testEndImg, state:'COUPON' },
    ];

    const events = activeTab === "ongoing" ? ongoingEvents : endedEvents;
    const visibleList = events.slice(0, visibleEvents);

    useEffect(() => {
        if (inView && visibleEvents < events.length && !isFetching.current) {
            isFetching.current = true;
            setTimeout(() => {
                setVisibleEvents((prev) => Math.min(prev + 3, events.length));
                isFetching.current = false;
            }, 500);
        }
    }, [inView]);
    useEffect(() => {
        setVisibleEvents(3);
    }, [activeTab]);

    return (
        <div className="event-container">
            <div className="tab-menu">
                <button
                    onClick={() => setActiveTab("ongoing")}
                    className={activeTab === "ongoing" ? "active" : ""}
                >
                    진행 중 이벤트
                </button>
                <button
                    onClick={() => setActiveTab("ended")}
                    className={activeTab === "ended" ? "active" : ""}
                >
                    완료된 이벤트
                </button>
                { user && user.user.authority == 'ROLE_ADMIN' &&
                <button onClick={()=>navigate('/event/write')}>
                    글쓰기
                </button>
                }
            </div>
            <div className="event-list">
                {visibleList.map((event) => (
                    <div className={`event-banner ${activeTab === "ended" ? "ended" : ""}`} key={event.id}>
                        <img src={event.src} alt={event.eventName} />
                        <div className="event-date">📅{event.startDate} ~ 📅{event.endDate}</div>
                        <div className="event-title">{event.eventName}</div>
                        {event.state === "COUPON" && <div className="coupon-badge">쿠폰 지급!</div>}
                    </div>
                ))}
            </div>
            <div ref={ref} className="loading-trigger"></div>
        </div>
    );
}

export default EventIndex;
