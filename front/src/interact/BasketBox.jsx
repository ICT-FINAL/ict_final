import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import axios from "axios";

function BasketBox() {
  let serverIP = useSelector((state) => state.serverIP);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTransform, setModalTransform] = useState('scale(0.8)');
  const mount = useRef(true);
  const modal_name = useRef('basket-box-modal');
  const modalSel = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const selectedItem = modalSel.selectedItem;
  const item = selectedItem;

  useEffect(() => {
    console.log("모달에 전달된 아이템:", selectedItem);
    if (modalSel.isOpen && selectedItem) {
      setModalOpen(true);
      setModalTransform('scale(1)');
      setQuantity(selectedItem.quantity); // 선택된 아이템의 수량 설정
    } else {
      setModalOpen(false);
      setModalTransform('scale(0.8)');
    }
  }, [modalSel.isOpen, selectedItem]);

  const modalClose = () => {
    dispatch(setModal({ ...modalSel, isOpen: false }));
    setModalOpen(false);
    setModalTransform('scale(0.8)');
  }

  useEffect(() => {
    if (user) {
      axios
        .get(`${serverIP.ip}/basket/list`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          console.log("장바구니리스트:", res.data);

        })
        .catch((err) => console.log(err));
    }
  }, [user, serverIP]);

  const handleQuantityChange = (e) => {
    const newQty = parseInt(e.target.value, 10);
    if (!isNaN(newQty) && newQty > 0) {
      setQuantity(newQty);
    }
  };

  const handleSave = () => {
    if (!user || !selectedItem) return;
    setIsSaving(true);
    axios.patch(`${serverIP.ip}/basket/update`, {
      basketNo: selectedItem.basketNo,
      quantity: quantity
    }, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(() => {
        alert("수정이 완료되었습니다.");
        dispatch(setModal({ ...modalSel, isOpen: false }));
      })
      .catch((err) => {
        console.error(err);
        alert("수정 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

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

  const modalBackStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    zIndex: 10000, opacity: modalOpen ? 1 : 0, transition: 'opacity 0.3s ease'
  };

  const modalStyle = {
    position: 'fixed', width: '600px', height: '550px', backgroundColor: '#fff',
    zIndex: 10001, opacity: modalOpen ? 1 : 0, transform: modalTransform,
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
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>주문 수정</span>
        </div>

        {selectedItem && (
          <div style={{ padding: '10px' }}>
            <img style={{ width: '20vw', height: '20vw', borderRadius: '10px' }}
              src={`${serverIP.ip}/uploads/product/${item.sellerNo.id}/${item.sellerNo.images[0].filename}`}
            />
            <p><strong>상품명:</strong> {selectedItem.sellerNo?.productName}</p>
            <p><strong>현재 수량:</strong></p>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              style={{ padding: '6px', width: '100px' }}
            />
            <br /><br />
            <button style={buttonStyle} onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default BasketBox;