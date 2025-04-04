import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import { setSearch } from "../store/searchSlice";

function CategoryModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransform, setModalTransform] = useState('scale(0.8)'); 
    const mount = useRef(true);
    const modal_name = useRef('category-modal');
    const modalSel = useSelector((state) => state.modal);
    
    const search = useSelector((state) => state.search);

    const [selectedCategories, setSelectedCategories] = useState({});
    
    const dispatch = useDispatch();

    const modalClose = () => {
        dispatch(setModal({...modalSel, isOpen:false}));
        setModalOpen(false);
        setModalTransform('scale(0.8)');
    }

    useEffect(() => {
        if (modalSel.isOpen) {
            setModalOpen(true);
            setModalTransform('scale(1)');
            
            const selectedData = search.productCategory || [];
            const updatedCategories = {};
    
            Object.keys(modalSel.info).forEach(category => {
                const subCategories = modalSel.info[category] || [];
                const selectedSubCategories = subCategories.filter(sub => selectedData.includes(sub));
    
                if (selectedSubCategories.length > 0) {
                    updatedCategories[category] = {
                        isChecked: selectedSubCategories.length === subCategories.length,
                        subCategories: selectedSubCategories
                    };
                }
            });
    
            setSelectedCategories(updatedCategories);
        }
    }, [modalSel.isOpen, search.productCategory, modalSel.info]);

    useEffect(() => {
        if (!mount.current) mount.current = false;
        else {
          let modal = document.getElementById(modal_name.current);
  
          modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';
          modal.style.top = (window.innerHeight - modal.offsetHeight) / 2 + 'px';
    
          let clicked = 0;
          let f_x = 0;
          let f_y = 0;
  
          let m_x = 0;
          let m_y = 0;
          
          let c_x = 0;
          let c_y = 0;
          
          let cnt = 0;
    
          document.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
              modalClose();
            }
          });
    
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
              window.addEventListener("mouseup", (e) => {
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
        if (_px === null || _px === "") {
          return 0;
        }
        _px = _px + "";
        if (_px.indexOf("px") > -1) {
          _px = _px.replace("px", "");
        }
        if (_px.indexOf("PX") > -1) {
          _px = _px.replace("PX", "");
        }
        var result = parseInt(_px, 10);
        if ((result + "") == "NaN") {
          return 0;
        }
        return result;
      }
  
    const modalBackStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        opacity: modalOpen ? 1 : 0,
        transition: 'opacity 0.3s ease'
    };

    const modalStyle = {
        position: 'fixed',
        width: '600px',
        height: '600px',
        backgroundColor: 'white',
        zIndex: 2001,
        opacity: modalOpen ? 1 : 0,
        transform: modalTransform,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
    };

    const contentStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '5px',
        maxHeight: '500px' // 모달 내 스크롤 가능하도록 설정
    };

    const exitStyle = {
        position:'absolute',
        top:'15px',
        right:'25px',
        fontSize:'30px',
        cursor:'pointer'
    };

    const categoryWrapperStyle = {
        marginTop: '10px' // 대분류 간 간격 추가
    };

    const categoryContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px', // 소분류 간격 추가
        marginLeft: '20px',
        alignItems: 'center'
    };

    const handleCategoryChange = (category) => {
        const isChecked = !selectedCategories[category]?.isChecked;
        const subCategories = modalSel.info[category] || [];
    
        setSelectedCategories(prev => {
            const updated = { ...prev };
            updated[category] = { 
                isChecked, 
                subCategories: isChecked ? subCategories : [] 
            };
            return updated;
        });
    };

    const handleSubCategoryChange = (category, subCategory) => {
        setSelectedCategories(prev => {
            const updated = { ...prev };
            const subCategories = new Set(updated[category]?.subCategories || []);
            if (subCategories.has(subCategory)) {
                subCategories.delete(subCategory);
            } else {
                subCategories.add(subCategory);
            }
            updated[category] = { 
                isChecked: subCategories.size === modalSel.info[category]?.length, 
                subCategories: Array.from(subCategories) 
            };
            return updated;
        });
    };

    // 확인 버튼 클릭 시 선택된 소분류 부모로 전달
    const modal = useSelector((state) => state.modal);
    
    const handleConfirm = () => {
        const selectedData = Object.values(selectedCategories)
            .flatMap(category => category.subCategories); // 선택된 소분류만 추출
        dispatch(setSearch({...search, productCategory: selectedData}));
        dispatch(setModal({ ...modal, isOpen: false })); // 모달 닫기
    };

    return (
      <>
        <div id="modal-background" style={modalBackStyle}></div>
        <div id={`${modal_name.current}`} style={modalStyle}>
          <div style={exitStyle} onClick={modalClose}>X</div>
          <h3 style={{marginBottom:'5px'}}>상품 카테고리 선택</h3>
          
          <div style={contentStyle}>
            {Object.keys(modalSel.info).map((category) => (
                <div key={category} style={categoryWrapperStyle}>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={selectedCategories[category]?.isChecked || false}
                            onChange={() => handleCategoryChange(category)}
                        />
                        <strong>{category}</strong>
                    </label>
                    <div style={categoryContainerStyle}>
                      {modalSel.info[category]?.map((subCategory) => (
                          <label key={subCategory}>
                              <input 
                                  type="checkbox" 
                                  checked={selectedCategories[category]?.subCategories.includes(subCategory) || false}
                                  onChange={() => handleSubCategoryChange(category, subCategory)}
                              />
                              {subCategory}
                          </label>
                      ))} 
                    </div>
                </div>
            ))}
          </div>
          
          <button onClick={handleConfirm}>확인</button>
        </div>
      </>
    );
  }
  
  export default CategoryModal;
