import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';

import Main from "./Main";

import Test from './Test';

import Login from "./user/Login";
import SignupHandler from "./user/SignupHandler";
import Signup from "./user/Signup";
import SignupInfo from './user/SignupInfo';
import GoogleSignupHandler from './user/GoogleSignupHandler';
import Modal from '../modal/Modal';
import Modal2 from '../modal/Modal2';
import { useSelector } from 'react-redux';
function Body() {
  const modal = useSelector((state) => state.modal);
  
  return (<>
    {modal.isOpen && modal.selected=='1' && <Modal/>}
    {modal.isOpen && modal.selected=='2' && <Modal2/>}
    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/test" element={<Test/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/signup/info" element={<SignupInfo/>} />
      <Route exact path="/login/oauth2/code/kakao" element={<SignupHandler/>}/>
      <Route exact path="/login/oauth2/code/google" element={<GoogleSignupHandler/>}/>
    </Routes>
    </>
  );
}

export default Body;