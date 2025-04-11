import { useLocation } from 'react-router-dom';

function Chatting() {
    const location = useLocation();
    const { productId, sellerNo } = location.state || {};

    console.log("넘어온 productId:", productId);
    console.log("넘어온 sellerNo:", sellerNo);
    
    return (
        <div>
            
        </div>
    )
}

export default Chatting;