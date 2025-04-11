import { BrowserRouter as Router, Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
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
import BasketBox from '../interact/BasketBox';
import Report from '../interact/Report';

import MyIndex from './user/mypage/MyIndex';
import Post from '../modal/Post';
import Already from './user/Already';

import { setInteract } from '../store/interactSlice';
import { setMenuModal } from '../store/menuSlice';
import { setModal } from '../store/modalSlice';
import Interact from '../interact/Interact';

import { useSelector, useDispatch } from 'react-redux';
import AdminIndex from './admin/AdminIndex';

import ProductIndex from './product/ProductIndex';
import ProductSearch from './product/ProductSearch';

import CenterHome from './customerservice/CenterHome';
import InquiryWrite from './customerservice/InquiryWrite';
import FAQ from './customerservice/FAQ';
import ProductSell from './product/ProductSell';
import ReportApprove from '../interact/ReportApprove';
import CategoryModal from '../modal/CategoryModal';
import ProductInfo from './product/ProductInfo';
import ProductBuy from './product/ProductBuy';
import PaymentSuccess from './product/PaymentSuccess';
import PaymentFail from './product/PaymentFail';
import RecommendIndex from './recommend/RecommendIndex';
import EventIndex from './event/EventIndex';
import CommunityIndex from './community/CommunityIndex';
import EventWrite from './event/EventWrite';
import EventInfo from './event/EventInfo';
import UserInfo from './user/UserInfo';

import AuctionIndex from './auction/AuctionIndex';
import AuctionRoom from './auction/AuctionRoom';
import DailyCheck from './event/coupon/DailyCheck';
import MyInquiryList from './user/mypage/MyInquiryList';
import InquiryView from './customerservice/InquiryView';
import AuctionSell from './auction/AuctionSell';
import AuctionBid from './auction/AuctionBid';
import AuctionBidSuccess from './auction/AuctionBidSuccess';

function Body() {
  const modal = useSelector((state) => state.modal);

  const al_mount = useRef(false);

  const interact = useSelector((state) => state.interact);

  const dispatch = useDispatch();
  const location = useLocation();

  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    if (al_mount.current) {
      dispatch(setInteract({ ...interact, isOpen: false }));
      dispatch(setMenuModal(false));
    }
  }, [modal]); //모달 열리면 상호작용 그거 닫힘

  useEffect(()=>{
    dispatch(setInteract({...interact, isOpen:false}));
    dispatch(setMenuModal(false));
    window.scrollTo({ top: 0, behavior: "smooth" });
  },[location]);

  useEffect(() => {
    if (!al_mount.current) {
      al_mount.current = true;

      const handleClick = (e) => {
        console.log(modal);
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
          if (user)
            axios.get(`${serverIP.ip}/auth/me`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
              .then(res => {
                if (e.target.id.split('-')[1] != res.data.id){
                    dispatch(setInteract({ ...interact, selected: e.target.id.split('-')[1], select: res.data.id, pageX: e.pageX, pageY: e.pageY, isOpen: true }));
                }
              })
              .catch(err => console.log(err))
        }
      };

      window.addEventListener('click', handleClick);

      return () => {
        window.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (<>
    {modal.isOpen && modal.selected == '1' && <ModalIndex />}
    {modal.isOpen && modal.selected == '2' && <Modal2 />}
    {modal.isOpen && modal.selected == 'message' && <Message />}
    {modal.isOpen && modal.selected == 'message-box' && <MessageBox />}
    {modal.isOpen && modal.selected == 'basket-box' && <BasketBox />}
    {modal.isOpen && modal.selected == "DaumPost" &&
      <div className='daumpost'>
        <button title="X" className="post-close-btn" onClick={() => dispatch(setModal({ ...modal, isOpen: false }))} >X</button>
        <Post />
      </div>}

    {modal.isOpen && modal.selected == 'report' && <Report />}
    {modal.isOpen && modal.selected == 'reportapprove' && <ReportApprove />}
    {modal.isOpen && modal.selected == 'categorymodal' && <CategoryModal />}
    {interact.isOpen && <Interact />}

    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/test" element={<Test />} />
      <Route path="/signup/info" element={<SignupInfo />} />
      <Route exact path="/login/oauth2/code/kakao" element={<SignupHandler />} />
      <Route exact path="/login/oauth2/code/google" element={<GoogleSignupHandler />} />

      <Route path='/userinfo' element={<UserInfo key={location.state} />}></Route>
      <Route path='/mypage/*' element={<MyIndex />}></Route>
      <Route path='/mypage/myinquirylist' element={<MyInquiryList />}></Route>

      <Route path='/admin/*' element={<AdminIndex />}></Route>
      <Route path='/already' element={<Already />}></Route>

      <Route path='/product/*' element={<ProductIndex />}></Route>
      <Route path='/product/search' element={<ProductSearch />}></Route>

      <Route path='/customerservice/*' element={<CenterHome />}>
        <Route path="inquirywrite" element={<InquiryWrite />} />
        <Route path="faq" element={<FAQ />} />
      </Route>
      <Route path='/inquiry/inquiryview/:id' element={<InquiryView />} />

      <Route path='/product/sell' element={<ProductSell />}></Route>
      <Route path='/product/info' element={<ProductInfo />}></Route>
      <Route path='/product/buying' element={<ProductBuy />}></Route>
      <Route path="/payment/success" element={<PaymentSuccess />}></Route>
      <Route path="/payment/fail" element={<PaymentFail />}></Route>

      <Route path='/recommend/*' element={<RecommendIndex />}></Route>

      <Route path='/event/*' element={<EventIndex />}></Route>
      <Route path='/event/write' element={<EventWrite />}></Route>
      <Route path='/event/info' element={<EventInfo />}></Route>
      <Route path='/event/dailycheck' element={<DailyCheck />}></Route>

      <Route path='/community/*' element={<CommunityIndex />}></Route>

      <Route path='/auction/*' element={<AuctionIndex />}></Route>
      <Route path='/auction/room/:roomId' element={<AuctionRoom />}></Route>
      <Route path='/auction/sell' element={<AuctionSell/>}></Route>
      <Route path='/auction/bid' element={<AuctionBid/>}></Route>
      <Route path="/auction/bid/success" element={<AuctionBidSuccess/>} />
    </Routes>
  </>
  );
}

export default Body;