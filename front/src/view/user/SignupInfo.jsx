import { useLocation } from "react-router-dom";

function SignupInfo(){
    const loc = useLocation();
    return(<div>
        <img src={loc.state.picture}/>
        {loc.state.nickname}
    </div>)
}

export default SignupInfo;