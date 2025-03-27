import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { changeTest } from "../store";
import { Link } from "react-router-dom";

function Main(){
    let serverIP = useSelector((state) => {return state.serverIP});
    let test = useSelector((state) => {return state.test});
    let dispatch = useDispatch();

    function testfunc() {
        axios.get(`${serverIP.ip}/test`)
        .then(res=>console.log(res.data))
        .catch(err=>console.log(err))
        dispatch(
            changeTest({name:'김김', good:'누누'})
        )
    }

    return(<div>
        <button onClick={testfunc}>test</button>
        <Link to='/login'>로그인</Link>
        <Link to='/signup'>회원가입</Link>
    </div>)
}

export default Main;