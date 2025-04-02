import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import axios from 'axios';

import Main from "./Main";

import Test from './Test';

import SignupHandler from "./user/SignupHandler";
import SignupInfo from './user/SignupInfo';
import GoogleSignupHandler from './user/GoogleSignupHandler';
import ModalIndex from '../modal/ModalIndex';
import Modal2 from '../modal/Modal2';
import Message from '../interact/Message';
import MessageBox from '../interact/MessageBox';
import Report from '../interact/Report';

import MyIndex from './user/mypage/MyIndex';
import Already from './user/Already';

import { setInteract } from '../store/interactSlice';
import { setMenuModal } from '../store/menuSlice';

import Interact from '../interact/Interact';

import { useSelector, useDispatch } from 'react-redux';
import AdminIndex from './admin/AdminIndex';

import ProductIndex from './product/ProductIndex';
import ProductSearch from './product/ProductSearch';
import ProductSell from './product/ProductSell';

import ReportApprove from '../interact/ReportApprove';
function Body() {
  const modal = useSelector((state) => state.modal);
  
  const al_mount = useRef(false);

  const interact = useSelector((state) => state.interact);

  const dispatch = useDispatch();

  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  useEffect(()=>{
    if(al_mount.current) {
      dispatch(setInteract({...interact, isOpen:false}));
      dispatch(setMenuModal(false));
    }
  },[modal]); //모달 열리면 상호작용 그거 닫힘

  useEffect(() => {
    if (!al_mount.current) {
      al_mount.current = true;

      const handleClick = (e) => {
        if (e.target.className === 'message-who' || e.target.className === 'msg-who') {
          /*
          axios.post(`${serverIP}/tech/selUser`, {
            id: e.target.id.split('-')[1],
          })
          .then(res => {
            if (sessionStorage.getItem('id') != res.data.id) {
              setInteract({
                selected: res.data,
                isOpen: true,
                where: e,
              });
            }
          })
          .catch(err => console.log(err));
          */
         if(user)
          axios.get(`${serverIP.ip}/auth/me`,{
            headers: { Authorization: `Bearer ${user.token}`}
          })
          .then(res => {
            if(e.target.id.split('-')[1] != res.data.id)
              dispatch(setInteract({...interact, selected:e.target.id.split('-')[1], select:res.data.id, pageX:e.pageX, pageY:e.pageY ,isOpen:true}));
          })
          .catch(err=>console.log(err))
          }
      };

      window.addEventListener('click', handleClick);

      return () => {
        window.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (<>
    {modal.isOpen && modal.selected=='1' && <ModalIndex/>}
    {modal.isOpen && modal.selected=='2' && <Modal2/>}
    {modal.isOpen && modal.selected=='message' && <Message/>}
    {modal.isOpen && modal.selected=='message-box' && <MessageBox/>}
    {modal.isOpen && modal.selected=='report' && <Report/>}
    {modal.isOpen && modal.selected=='reportapprove' && <ReportApprove/>}
    {interact.isOpen && <Interact/>}

    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/test" element={<Test/>} />
      <Route path="/signup/info" element={<SignupInfo/>} />
      <Route exact path="/login/oauth2/code/kakao" element={<SignupHandler/>}/>
      <Route exact path="/login/oauth2/code/google" element={<GoogleSignupHandler/>}/>
      
      <Route path='/mypage/*' element={<MyIndex/>}></Route>
      <Route path='/admin/*' element={<AdminIndex/>}></Route>
      <Route path='/already' element={<Already/>}></Route>

      <Route path='/product/*' element={<ProductIndex/>}></Route>
      <Route path='/product/search' element={<ProductSearch/>}></Route>
      <Route path='/product/sell' element={<ProductSell/>}></Route>
    </Routes>
    </>
  );
}

export default Body;