package com.ict.serv.repository.chat;

import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    ChatRoom findByBuyerAndProductId(User user, Long productId);

    List<ChatRoom> findByBuyerAndState(User user, ChatState state);

    List<ChatRoom> findByProductInAndState(List<Product> productList, ChatState state);
}
