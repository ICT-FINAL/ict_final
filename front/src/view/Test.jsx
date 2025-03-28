import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { changeTest } from "../store";
import { setModal } from "../store/modalSlice";

function Test() {
    let serverIP = useSelector((state) => state.serverIP);
    let dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const test = useSelector((state) => state.test);
    const modal = useSelector((state) => state.modal);

    function testfunc2(){
        console.log(test);
        dispatch(changeTest({name:'tq',good:'bt'}));
    }
    function modalTest(){
        console.log(modal);
        if(!modal.isOpen) dispatch(setModal({isOpen:true, selected:'1'}))
        else if(modal.selected == '1'){
            dispatch(setModal({isOpen:false, selected:'1'}))
        }
    }
    function modalTest2(){
        console.log(modal);
        if(!modal.isOpen) dispatch(setModal({isOpen:true, selected:'2'}))
        else if(modal.selected == '2'){
            dispatch(setModal({isOpen:false, selected:'2'}))
        }
    }
    useEffect(() => {
        console.log("현재 로그인된 사용자:", user);
    }, [user]);

    return (
        <div>  
            <button onClick={testfunc2}>리덕스 테스트</button>
            <button onClick={modalTest}>1번 모달 테스트</button>
            <button onClick={modalTest2}>2번 모달 테스트</button>
        </div>
    );
}

export default Test;