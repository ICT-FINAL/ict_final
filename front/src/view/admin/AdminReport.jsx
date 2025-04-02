import axios from "axios";
import { useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import { useSelector } from "react-redux";

function AdminReport(){
    const loc = useLocation();
    const serverIP = useSelector((state) => {return state.serverIP});
    const user = useSelector((state) => state.auth.user);

    const [report_readable,setReport_readable] = useState([]);

    useEffect(()=> {
        if(user)
            axios.get(`${serverIP.ip}/admin/reportList`,{
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
                console.log(res.data);
                setReport_readable(res.data);
            })
    },[loc])

    return(
        <div style={{paddingLeft:'10px'}}>
            신고 리스트
            <ul className='admin-list' style={{fontWeight:'bold', borderBottom:'1px solid #ddd'}}>
                <li>
                    분류
                </li>
                <li>
                    내용    
                </li>
                <li>
                    신고자
                </li>
                <li>
                    피신고자
                </li>
            </ul>
            {
                report_readable.map(item => {
                    return (<ul className='admin-list'>
                        <li>
                            {item.reportType}
                        </li>
                        <li>
                            {item.comment}    
                        </li>
                        <li className='message-who' id={`mgx-${item.userFrom.id}`} style={{cursor:'pointer'}}>
                            {item.userFrom.username}
                        </li>
                        <li className='message-who' id={`mgx-${item.reportUser.id}`} style={{cursor:'pointer'}}>
                            {item.reportUser.username}
                        </li>
                    </ul>)
                })
            }
        </div>
    );
}
export default AdminReport;