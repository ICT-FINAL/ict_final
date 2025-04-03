import React, { useState } from 'react';
import CustomEditor from './CustomEditor'; 
import '../../css/view/InquiryWrite.css';

function InquiryWrite() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submittedData, setSubmittedData] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('문의 내용을 입력해주세요.');
            return;
        }

        setSubmittedData({ title, content });
        setTitle('');
        setContent('');
    };

    return (
        <div className="inquiryWrite-container">
            <h2>1:1 문의하기</h2>
            <div>문의유형</div>
            <form onSubmit={handleSubmit} className="inquiry-form">
                <div className="form-group">
                    <label htmlFor="inquiryTitle">제목</label>
                    <input
                        type="text"
                        id="inquiryTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="문의 제목 입력"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inquiryContent">내용</label>
                    <CustomEditor content={content} setContent={setContent} /> {/* CKEditor 사용 */}
                </div>

                <button type="submit" className="submit-button">문의 제출</button>
            </form>

            {submittedData && (
                <div className="submitted-data">
                    <h3>제출된 내용 확인</h3>
                    <p><strong>제목:</strong> {submittedData.title}</p>
                    <div dangerouslySetInnerHTML={{ __html: submittedData.content }} />
                </div>
            )}
        </div>
    );
}

export default InquiryWrite;
