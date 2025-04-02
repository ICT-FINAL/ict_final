function Reports(){
    return(
        <div style={{paddingLeft:'10px'}}>
                <div className='report-box'>
                    <span style={{paddingLeft:'0px', fontSize:'17px', fontWeight:'600',color:'#555'}}>📢신고 처리 전</span>
                    <div className='report-search'>
                        <div>총 신고 수: 000000건</div>
                            <div>
                                <select>
                                    <option value="">전체</option>
                                    <option value="욕설 및 비방">욕설 및 비방</option>
                                    <option value="부적절한 컨텐츠">부적절한 컨텐츠</option>
                                    <option value="허위 정보 및 사기">허위 정보 및 사기</option>
                                    <option value="스팸 및 광고">스팸 및 광고</option>
                                    <option value="기타">기타</option>
                                </select>
                                <input placeholder="번호/내용/신고자/피신고자"/>
                            </div>
                    </div>
                </div>
        </div>
    );
}

export default Reports;