import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';

import Main from "./Main";

import Login from "./user/Login";
import SignupHandler from "./user/SignupHandler";
import Signup from "./user/Signup";
import SignupInfo from './user/SignupInfo';
import GoogleSignupHandler from './user/GoogleSignupHandler';
function Body() {
  return (
    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/signup/info" element={<SignupInfo/>} />
      <Route exact path="/login/oauth2/code/kakao" element={<SignupHandler/>}/>
      <Route exact path="/login/oauth2/code/google" element={<GoogleSignupHandler/>}/>
    </Routes>
  );
}

export default Body;