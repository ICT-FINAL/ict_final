import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import '../../css/address.css';
import { setModal } from "../../store/modalSlice";

function AddressForm({ onAddAddress, isGet, setSelectedAddresses}) {
    const [recipientName, setRecipientName] = useState("");
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [tel, setTel] = useState("");
    const [addressType, setType] = useState("HOME");
    const [addressList, setAddressList] = useState([]);
    const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);

    useEffect(() => {
        if (user) 
            axios
                .get(`${serverIP.ip}/mypage/getAddrList`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    setAddressList(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
    }, [user, serverIP]);

    useEffect(() => {
        if (user) 
            axios
                .get(`${serverIP.ip}/mypage/getAddrList`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    setAddressList(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
    }, [isGet]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newAddress = { recipientName, address: modal.info.address, addressDetail, zipcode: modal.info.zonecode, tel, addressType };
        onAddAddress(newAddress);
        setRecipientName("");
        setAddress("");
        setAddressDetail("");
        setZipcode("");
        setTel("");
        setType("HOME");
        setIsAddressFormVisible(false);
    };

    const handleSelectChange = (e) => {
        const selectedAddressId = e.target.value;
        
        if (!selectedAddressId) {
            setSelectedAddress(null);
            setSelectedAddresses('');
            return;
        }

        for(var i = 0; i < addressList.length; i++) {
            if(addressList[i].id == selectedAddressId) {
                setSelectedAddress(addressList[i]);
                setSelectedAddresses(addressList[i]);
                return;
            }
        }
    };

    function ENUUUM(a) {
        if(a === 'HOME') return '집'
        if(a === 'COMPANY') return '회사'
        if(a === 'OTHER') return '기타'
    }

    const dispatch = useDispatch();

    const openPost = () => {
        dispatch(setModal({ isOpen: !modal.isOpen, selected: "DaumPost" }));
    };

    return (
        <div className="address-form">
            <h3>배송지 선택</h3>
            {addressList.length > 0 ? (
                <div>
                    <select className="address-select" onChange={handleSelectChange}>
                        <option value="">배송지 선택</option>
                        {addressList.map((addressItem) => (
                            <option key={addressItem.id} value={addressItem.id}>
                                {addressItem.recipientName} - {addressItem.address}
                            </option>
                        ))}
                    </select>
                    <button className="add-address-button" onClick={() => setIsAddressFormVisible(true)}>+ 배송지 등록</button>    
                </div>
            ) : (
                <div>
                    <p className="no-address-text">등록된 배송지가 없습니다.</p>
                    <button className="add-address-button" onClick={() => setIsAddressFormVisible(true)}>+ 배송지 등록</button>
                </div>
            )}

            {selectedAddress && (
                <div style={{border:'1px solid #ddd', marginTop:'10px', paddingLeft:'10px'}}>
                    <p>이름: {selectedAddress.recipientName}</p>
                    <p>주소: {selectedAddress.address}</p>
                    <p>상세 주소: {selectedAddress.addressDetail}</p>
                    <p>전화번호: {selectedAddress.tel}</p>
                    <p>구분: {ENUUUM(selectedAddress.addressType)}</p>
                </div>
            )}

            {isAddressFormVisible && (
                <div className="address-form-modal">
                    <h3>배송지 등록</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <label>우편번호</label>
                            <div className="zipcode-wrapper">
                                <input
                                    className="input-field zipcode-input"
                                    type="text"
                                    value={modal.info && modal.info.zonecode}
                                    readOnly
                                />
                                <button type="button" className="zipcode-search-button" onClick={openPost}>
                                    우편번호 찾기
                                </button>
                            </div>
                        </div>
                        <div className="form-grid">
                            <label>주소</label>
                            <input style={{ width: '90%' }}
                                className="input-field"
                                type="text"
                                value={modal.info && modal.info.address} 
                                readOnly
                            />
                        </div>
                        <div className="form-grid">
                            <label>상세 주소</label>
                            <input style={{ width: '90%' }}
                                className="input-field"
                                type="text"
                                value={addressDetail}
                                onChange={(e) => setAddressDetail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-grid">
                            <label>수령인 이름</label>
                            <input style={{ width: '90%' }}
                                className="input-field"
                                type="text"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-grid">
                            <label>전화번호</label>
                            <input style={{ width: '90%' }}
                                className="input-field"
                                type="text"
                                value={tel}
                                onChange={(e) => setTel(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-grid">
                            <label>구분</label>
                            <select style={{ width: '25%' }}
                                className="input-field"
                                onChange={(e) => setType(e.target.value)}>
                                <option value="HOME">집</option>
                                <option value="COMPANY">회사</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </div>
                        <div className="address-button-container">
                            <button type="submit" className="button">등록</button>
                            <button type="button" className="cancel-button" onClick={() => setIsAddressFormVisible(false)}>취소</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddressForm;
