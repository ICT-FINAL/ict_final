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

    ChatRoom findByBuyerAndProductIdAndState(User user, Long productId, ChatState state);

    List<ChatRoom> findByBuyerAndStateOrderByLastChat_SendTimeDesc(User user, ChatState state);

    List<ChatRoom> findByProductInAndStateInOrderByLastChatSendTimeDesc(List<Product> productList, List<ChatState> states);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom c SET c.state = 'LEFT' WHERE c.chatRoomId = :roomId")
    void updateChatRoomStateToLeft(@Param("roomId") String roomId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatRoom c SET c.state = 'CLOSED' WHERE c.chatRoomId = :roomId")
    void updateChatRoomStateToClosed(@Param("roomId") String roomId);
}
