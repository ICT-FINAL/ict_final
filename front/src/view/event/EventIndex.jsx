import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import testImg from './event_test.jpg';
import testEndImg from './event_end_test.jpg';
function EventIndex() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleEvents, setVisibleEvents] = useState(3);
    const isFetching = useRef(false); // 여러 번 실행되는 것을 방지

    const { ref, inView } = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    const ongoingEvents = [
        { id: 1, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트1", src: testImg },
        { id: 2, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트2", src: testImg },
        { id: 3, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트3", src: testImg },
        { id: 4, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트4", src: testImg },
        { id: 5, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트5", src: testImg },
        { id: 6, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트6", src: testImg },
        { id: 7, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트7", src: testImg },
        { id: 8, startDate: "2025-03-27", endDate: "2025-04-05", eventName: "이벤트8", src: testImg },
    ];

    const endedEvents = [
        { id: 1, startDate: "2025-03-26", endDate: "2025-04-01", eventName: "이벤트1", src:testEndImg },
        { id: 2, startDate: "2025-03-25", endDate: "2025-04-01", eventName: "이벤트2", src:testEndImg  },
        { id: 3, startDate: "2025-03-24", endDate: "2025-04-01", eventName: "이벤트3", src:testEndImg  },
        { id: 4, startDate: "2025-03-23", endDate: "2025-04-01", eventName: "이벤트4", src:testEndImg  },
        { id: 5, startDate: "2025-03-26", endDate: "2025-04-01", eventName: "이벤트5", src:testEndImg  },
        { id: 6, startDate: "2025-03-28", endDate: "2025-04-01", eventName: "이벤트6", src:testEndImg  },
        { id: 7, startDate: "2025-03-26", endDate: "2025-04-01", eventName: "이벤트7", src:testEndImg  },
        { id: 8, startDate: "2025-03-21", endDate: "2025-04-01", eventName: "이벤트8", src:testEndImg  },
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
            </div>
            <div className="event-list">
                {visibleList.map((event) => (
                    <div className={`event-banner ${activeTab === "ended" ? "ended" : ""}`} key={event.id}>
                        <img src={event.src} alt={event.eventName} />
                        <div className="event-date">📅{event.startDate} ~ 📅{event.endDate}</div>
                        <div className="event-title">{event.eventName}</div>
                    </div>
                ))}
            </div>
            <div ref={ref} className="loading-trigger"></div>
        </div>
    );
}

export default EventIndex;
