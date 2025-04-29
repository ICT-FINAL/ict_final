import axios from "axios";
import EventEditor from "./EventEditor";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function EventEdit(){
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const { id } = useParams(); // URL에서 id를 가져옵니다.
    
    const [eventInfo, setEventInfo] = useState({
        eventName: "",
        startDate: "",
        endDate: "",
        state: "NOCOUPON",
        content: "",
        filename: ""
    });

    useEffect(() => {
        if (id) {
            axios.get(`${serverIP.ip}/event/edit/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then((response) => {
                console.log("Response Data:", response.data);
                const startDate = response.data.startDate ? response.data.startDate.split(' ')[0] : "";
                const endDate = response.data.endDate ? response.data.endDate.split(' ')[0] : "";
    
                setEventInfo({
                    eventName: response.data.eventName || "",
                    startDate: startDate,
                    endDate: endDate,
                    state: response.data.state || "NOCOUPON",
                    content: response.data.content || "",
                    filename: response.data.filename || "",  // filename이 없으면 빈 문자열로 설정
                });
            })
            .catch((error) => {
                console.error("Error fetching event data: ", error);
            });
        }
    }, [id]);

    // 시작날짜, 종료날짜, 이벤트유형에 대한 상태값을 처리하는 함수
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventInfo(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    return(
        <div style={{ paddingTop: "150px" }}>
            <div className="event-write-container">
                <h2 className="event-write-title">이벤트 수정</h2>

                <label className="event-write-label">이벤트명</label>
                <input type="text" name="eventName" className="event-write-input" value={eventInfo.eventName} onChange={handleInputChange}/>

                <label className="event-write-label">시작 날짜</label>
                <input type="date" name="startDate" className="event-write-input" value={eventInfo.startDate} onChange={handleInputChange}/>

                <label className="event-write-label">종료 날짜</label>
                <input type="date" name="endDate" className="event-write-input" value={eventInfo.endDate} onChange={handleInputChange}/>

                <label className="event-write-label">이벤트 유형</label>
                <select name="eventState" className="event-write-select" value={eventInfo.state} onChange={handleInputChange}>
                    <option value="NOCOUPON">NOCOUPON</option>
                    <option value="COUPON">COUPON</option>
                </select>

                <label className="event-write-label">이벤트 내용</label>
                {eventInfo.content &&
                    <EventEditor formData={eventInfo} setFormData={setEventInfo} />
                }

                <div className="event-write-file-upload">
                    {eventInfo.filename ? (
                        <img 
                            src={`${serverIP.ip}/uploads/event/${id}/${eventInfo.filename}`} 
                            alt="Event Thumbnail" 
                            className="event-write-thumbnail" 
                        />
                    ) : (
                        <span>썸네일 이미지를 선택하거나 드래그하세요</span> // 파일이 없으면 대체 텍스트 표시
                    )}
                </div>
                <button className="event-write-remove-file" >삭제</button>
                <input type="file"  style={{ display: "none" }} accept="image/*"  />

                <button style={{ 
                            marginTop:'30px',
                            width:'100%',
                            backgroundColor: '#333', 
                            color: 'white', 
                            padding: '10px 15px', 
                            border: 'none', 
                            cursor: 'pointer',
                            borderRadius: '5px'
                        }} className="event-write-submit">이벤트 수정</button>
            </div>
        </div>
    );
}

export default EventEdit;