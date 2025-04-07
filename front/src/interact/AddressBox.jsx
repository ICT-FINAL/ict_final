import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import axios from "axios";

function AddressBox() {
  let serverIP = useSelector((state) => state.serverIP);

  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTransform, setModalTransform] = useState('scale(0.8)');
  const mount = useRef(true);
  const modal_name = useRef('address-box-modal');
  const modalSel = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const interact = useSelector((state) => state.interact);

  const modalClose = () => {
    dispatch(setModal({ ...modalSel, isOpen: false }));
    setModalOpen(false);
    setModalTransform('scale(0.8)');
  }

  useEffect(() => {
    if (user) {
      axios
        .get(`${serverIP.ip}/auth/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          console.log("유저정보:", res.data);
          setAddress(res.data.address);
          setAddressDetail(res.data.addressDetail);
          setZipcode(res.data.zipcode);
        })
        .catch((err) => console.log(err));
    }
  });

  useEffect(() => {
    if (modalSel.isOpen) {
      setModalOpen(true);
      setModalTransform('scale(1)');
    }
  }, [modalSel.isOpen]);

  useEffect(() => {
    if (!mount.current) mount.current = false;
    else {
      let modal = document.getElementById(modal_name.current);
      modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';
      modal.style.top = (window.innerHeight - modal.offsetHeight) / 2 + 'px';

      let clicked = 0, f_x = 0, f_y = 0, m_x = 0, m_y = 0, c_x = 0, c_y = 0, cnt = 0;
      document.addEventListener('keyup', (e) => e.key === 'Escape' && modalClose());

      if (modal)
        modal.addEventListener("mousedown", (e) => {
          if (clicked === 0) {
            c_x = getNumberFromPixel(modal.style.left);
            c_y = getNumberFromPixel(modal.style.top);
            modal.style.cursor = "grabbing";
            clicked = 1;
          }
          setTimeout(function moveModal() {
            modal.style.left = c_x + m_x - f_x + 'px';
            modal.style.top = c_y + m_y - f_y + 'px';
            c_x = getNumberFromPixel(modal.style.left);
            c_y = getNumberFromPixel(modal.style.top);
            f_x = m_x;
            f_y = m_y;
            setTimeout(moveModal, 10);
            cnt++;
          }, 10);
          window.addEventListener("mouseup", () => {
            cnt = 0;
            clicked = 0;
            modal.style.cursor = "default";
          });
          window.addEventListener("mousemove", (e) => {
            if (clicked === 1) {
              m_x = e.clientX;
              m_y = e.clientY;
              if (cnt < 1000000) {
                cnt = 1000000;
                f_x = e.clientX;
                f_y = e.clientY;
              }
            }
          });
        });
    }
  }, []);

  function getNumberFromPixel(_px) {
    return _px ? parseInt(_px.replace("px", "")) || 0 : 0;
  }

  const reSend = (to) => {
    dispatch(setModal({ selected: 'message', isOpen: true }));
  }

  const handleAddAddress = () => {
    console.log("배송지 추가 버튼 클릭됨");
    // 여기에 배송지 추가 로직 (모달 열기, 입력창 표시 등) 구현 예정
  }

  const modalBackStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    zIndex: 2000, opacity: modalOpen ? 1 : 0, transition: 'opacity 0.3s ease'
  };

  const modalStyle = {
    position: 'fixed', width: '600px', height: '550px', backgroundColor: '#fff',
    zIndex: 2001, opacity: modalOpen ? 1 : 0, transform: modalTransform,
    borderRadius: '12px', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    padding: '20px', transition: 'opacity 0.3s ease, transform 0.3s ease'
  };

  const exitStyle = {
    position: 'absolute', top: '15px', right: '25px', fontSize: '24px',
    cursor: 'pointer', fontWeight: 'bold', color: '#555'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    marginRight: '100px',
    width: '50%',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  return (
    <>
      <div id="modal-background" style={modalBackStyle}></div>
      <div id={`${modal_name.current}`} style={modalStyle}>
        <div style={exitStyle} onClick={modalClose}>x</div>
        <div style={headerStyle}>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>배송지 목록</span>
          <button style={buttonStyle} onClick={handleAddAddress}>새 배송지 추가</button>
        </div>

        <div style={{ paddingLeft: "10px" }}>
          <div className="basket-addr">
            <span style={{ paddingLeft: "0px", fontSize: "17px", fontWeight: "600", color: "#555" }}>
              🏡 배송지 : <br /> {address}, <br /> {addressDetail},{zipcode}
            </span>
            <hr />
          </div>
        </div>
      </div>
    </>
  );



}
export default AddressBox;