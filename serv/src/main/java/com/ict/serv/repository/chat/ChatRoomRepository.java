package com.ict.serv.repository.chat;

import com.ict.serv.entity.chat.ChatRoom;
import com.ict.serv.entity.chat.ChatState;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    ChatRoom findByBuyerAndProductId(User user, Long productId);

    List<ChatRoom> findByBuyerAndStateNotOrderByLastChatSendTimeDesc(User user, ChatState state);

    List<ChatRoom> findByProductInAndStateOrderByLastChat_SendTimeDesc(List<Product> productList, ChatState state);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom c SET c.state = 'LEFT' WHERE c.chatRoomId = :roomId")
    void updateChatRoomStateToLeft(@Param("roomId") String roomId);
}
