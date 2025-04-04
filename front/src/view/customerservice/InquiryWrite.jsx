import React, { useRef, useState } from 'react';
import '../../css/view/InquiryWrite.css';
import { form } from 'framer-motion/client';
import { useSelector } from 'react-redux';
import axios from 'axios';
const MAX_CONTENT_LENGTH = 2000;
const MAX_FILES_COUNT = 5;

const InquiryWrite = () => {
    const [inquirySubject, setInquirySubject] = useState('');
    const [inquiryType, setInquiryType] = useState('');
    const [inquiryContent, setInquiryContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const user = useSelector((state) => state.auth.user);

    const handleTitleChange = (event) => {
        console.log(user);
        setInquirySubject(event.target.value);
    };

    const handleTypeChange = (event) => {
        setInquiryType(event.target.value);
    };

    const handleContentChange = (event) => {
        const content = event.target.value;
        if (content.length <= MAX_CONTENT_LENGTH) {
            setInquiryContent(content);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!inquirySubject.trim()) {
            setErrorMessage('문의제목을 입력해주세요.');
            return;
        }
        if (!inquiryType) {
            setErrorMessage('문의유형을 선택해주세요.');
            return;
        }
        if (!inquiryContent.trim()) {
            setErrorMessage('문의내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
    
        formData.append('inquiry_subject', inquirySubject);
        formData.append('inquiry_type', inquiryType);
        formData.append('inquiry_content', inquiryContent);
        formData.append('user_id', user.user.id);
        if (files.length > 0) {
            files.forEach((file) => {
                
                formData.append('inquiry_image', file, file.name);
            });
        }
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        axios.post("http://localhost:9977/Inquiry/inquiryWriteOk", formData)
        .then(function(response){
            
        })

    };


    const handleCancel = () => {
        window.history.back();
    };

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const changeFile = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (selectedFiles) => {
        setErrorMessage('');
        const newFiles = Array.from(selectedFiles);
        const imageFiles = newFiles.filter(file => file.type.startsWith("image/"));

        if (imageFiles.length !== newFiles.length) {
            setErrorMessage("이미지 파일만 업로드 가능합니다.");
            return;
        }

        const totalFiles = files.length + imageFiles.length;
        if (totalFiles > MAX_FILES_COUNT) {
             return;
        }

        setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };
    return (
        <div className="inquiry-form-container">
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <h1 className='main-title'>1:1 문의하기</h1>
                <div className="form-group">
                    <label htmlFor="inquiry-subject" className="form-label">문의제목</label>
                    <input
                        type="text"
                        id="inquiry-subject"
                        name="inquiry_subject"
                        className="form-control"
                        placeholder="제목을 입력해주세요."
                        value={inquirySubject}
                        onChange={handleTitleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inquiry-type" className="form-label">문의유형</label>
                    <select
                        id="inquiry-type"
                        name="inquiry_type"
                        className="form-control"
                        value={inquiryType}
                        onChange={handleTypeChange}
                        required
                    >
                        <option value="" disabled>문의유형 선택</option>
                        <option value="account">계정</option>
                        <option value="delivery">배송</option>
                        <option value="payment">결제</option>
                        <option value="refund">환불/교환</option>
                        <option value="coupon">쿠폰/이벤트</option>
                        <option value="etc">기타</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inquiry-content" className="form-label">문의내용</label>
                    <textarea
                        id="inquiry-content"
                        name="inquiry_content"
                        className="form-control textarea-content"
                        rows="10"
                        placeholder="문의 내용을 입력해주세요."
                        value={inquiryContent}
                        onChange={handleContentChange}
                        maxLength={MAX_CONTENT_LENGTH}
                        required
                    ></textarea>
                    <div id="char-counter" className="char-counter">
                        {inquiryContent.length}/{MAX_CONTENT_LENGTH}자
                    </div>
                </div>
                <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                style={{
                    width: '100%', 
                    height: '150px', 
                    border: '2px dashed #ccc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '10px',
                    cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current.click()}
            >
                이미지를 드래그/선택하여 1~5개 첨부해주세요
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={changeFile}
                />
                <button 
                    style={{ 
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} 
                    onClick={() => fileInputRef.current.click()}
                >
                    이미지 선택
                </button>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {files.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }} 
                        />
                        <span 
                            style={{
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px', 
                                backgroundColor: '#555', 
                                color: 'white', 
                                width: '20px', 
                                height: '20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '50%', 
                                fontSize: '14px', 
                                cursor: 'pointer'
                            }}
                            onClick={() => removeFile(file)}
                        >
                            ✕
                        </span>
                    </div>
                ))}
            </div>
            </div>
                <div className="button-group">
                    <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                        취소하기
                    </button>
                    <button type="submit" className="btn btn-submit" onClick={handleSubmit}>
                        등록하기
                    </button>
                </div>

            </form>
        </div>
    );
};

export default InquiryWrite;