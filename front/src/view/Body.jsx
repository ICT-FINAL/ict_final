import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import Main from "./Main";

import Test from './Test';

import SignupHandler from "./user/SignupHandler";
import SignupInfo from './user/SignupInfo';
import GoogleSignupHandler from './user/GoogleSignupHandler';
import ModalIndex from '../modal/ModalIndex';
import Modal2 from '../modal/Modal2';
import Message from '../interact/Message';

import { setInteract } from '../store/interactSlice';
import Interact from '../interact/Interact';

import { useSelector, useDispatch } from 'react-redux';
function Body() {
  const modal = useSelector((state) => state.modal);
  
  const al_mount = useRef(false);

  const interact = useSelector((state) => state.interact);

  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(setInteract({...interact, isOpen:false}));
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
         dispatch(setInteract({...interact, selected:e.target.id.split('-')[1], pageX:e.pageX, pageY:e.pageY ,isOpen:true}));
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

    {!modal.isOpen && interact.isOpen && <Interact/>}

    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/test" element={<Test/>} />
      <Route path="/signup/info" element={<SignupInfo/>} />
      <Route exact path="/login/oauth2/code/kakao" element={<SignupHandler/>}/>
      <Route exact path="/login/oauth2/code/google" element={<GoogleSignupHandler/>}/>
    </Routes>
    </>
  );
}

export default Body;