import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Main() {
    let serverIP = useSelector((state) => state.serverIP);
    let dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [event_list, setEvent_list] = useState([]);
    function testfunc() {
        if(user)
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
    useEffect(() => {
        console.log("현재 로그인된 사용자:", user);
    }, [user]);

    useEffect(()=> {
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
    },[])

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "20%",
        autoplay: true,
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

    return (
        <div style={{height:'1000px',paddingTop:'140px'}}>
            <div className="slider-container">
            <Slider {...settings}>
                {event_list.map((item, idx) => (
                    <div key={idx} className="slider-image-banner">
                        <img 
                            className="slider-image" 
                            src={item.src} 
                            alt={item.eventName} 
                        />

                        <div className="event-date-badge">
                            📅 {item.startDate.substring(0, 10)} ~ 📅 {item.endDate.substring(0, 10)}
                        </div>

                        {item.state === "COUPON" && <div className="main-coupon-badge">쿠폰 지급!</div>}

                        <Link className="event-button">Click ▶</Link>
                    </div>
                ))}
            </Slider>
          </div>
          {user ? (
                <>
                    <img src = {user.user.imgUrl.indexOf('http') !==-1 ? `${user.user.imgUrl}`:`${serverIP.ip}${user.user.imgUrl}`} alt='' width={100}/>
                    <h5>환영합니다, {user.user.username}님!</h5>
                </>
            ) : (<>
            <Link to="/test">테스트</Link><br/></>
            )}
            <button onClick={testfunc}>jwt 슛</button>
            <Link to="/test">테스트</Link><br/>
        </div>
    );
}

export default Main;