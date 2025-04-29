import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function EventInfo() {
    const loc = useLocation();
    const { eventName, filename, startDate, endDate, content, id } = loc.state;

    const serverIP = useSelector((state) => state.serverIP);

    const navigate = useNavigate();

    const handleEditClick = () => {
        if (id) {
            navigate(`/event/edit/${id}`);
        } else {
            alert("이벤트 ID가 없습니다.");
        }
    };

    return (
        <div style={{ paddingTop: "150px" }}>
            <div className="event-info-container">
                <h2 className="event-info-title">{eventName}</h2>  
                <div className="event-info-date">📅 {startDate.substring(0,10)} ~ 📅 {endDate.substring(0,10)}</div>
                <img
                    src={`${serverIP.ip}/uploads/event/${id}/${filename}`}
                    alt="이벤트 이미지"
                    className="event-main-image"
                />
                <div
                    className="event-info-content"
                    dangerouslySetInnerHTML={{ __html: content }}
                ></div>
                <div style={{textAlign:'right'}}>
                    <input type='button' value='수정' className="edit-button" style={{marginRight:'5px'}} onClick={handleEditClick}/>
                    <input type='button' value='삭제' className="del-button" />
                </div>
            </div>
        </div>
    );
}

export default EventInfo;
