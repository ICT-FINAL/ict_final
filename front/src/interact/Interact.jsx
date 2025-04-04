import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setInteract } from "../store/interactSlice";
import { setModal } from "../store/modalSlice";

function Interact() {
    const [dm, setDm] = useState(false);
    const [report, setReport] = useState(false);

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const interact = useSelector((state) => state.interact);
    const modal = useSelector((state) => state.modal);

    const closePopup = () => {
        dispatch(setInteract({...interact, isOpen:false}));
    };

    const moveInfo = (where) => {
        dispatch(setInteract({...interact, isOpen:false}));
        navigate('/userinfo', {state:interact.selected});
    }

    const openMessage = (wh) =>{
        dispatch(setModal({selected:wh, isOpen:true}));
    }

    return (
        <>
            <div className="interact-popup" style={{ left: interact.pageX, top: interact.pageY }}>
                <div className="interact-exit" onClick={closePopup}>x</div>
                <ul className="interact-list">
                    <li className="interact-item" onClick={()=> moveInfo(interact.selected)}>정보 보기</li>
                    <li className="interact-item" onClick={()=> openMessage('message')}>쪽지 보내기</li>
                    <li className="interact-item" onClick={()=> openMessage('report')}>신고 하기</li>
                </ul>
            </div>
        </>
    );
}

export default Interact;