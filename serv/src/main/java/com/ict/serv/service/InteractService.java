package com.ict.serv.service;

import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.user.Follow;
import com.ict.serv.entity.wish.WishPagingVO;
import com.ict.serv.entity.wish.Wishlist;
import com.ict.serv.entity.message.Message;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractService {
    private final UserRepository user_repo;
    private final MessageRepository message_repo;
    private final ReportRepository report_repo;
    private final WishRepository wish_repo;
    private final FollowRepository follow_repo;

    public User selectUser(Long id) {
        return user_repo.findUserById(id);
    }
    public User selectUserByName(String userid) {
        return user_repo.findUserByUserid(userid);
    }
    public void sendMessage(Message msg) {
        message_repo.save(msg);
    }
    public List<Message> getMessageList(User user) {
        return message_repo.findAllByUserToOrderByIdDesc(user);
    }
    public Message selectMessage(Long id) {
        return message_repo.findMessageById(id);
    }
    public void deleteMessage(Long id) {
        message_repo.deleteById(id);
    }

    public void sendReport(Report report) {
        report_repo.save(report);
    }

    public Optional<Report> selectReport(Long id) {
        return report_repo.findById(id);
    }

    public Wishlist selectWish(Long userId, Long productId) {
        return wish_repo.findByUser_IdAndProduct_Id(userId,productId);
    }
    public int selectWishCountByProduct(Product product){
        return wish_repo.countIdByProduct(product);
    }
    public Wishlist insertWish(Wishlist wish) {
        return wish_repo.save(wish);
    }

    public void deleteWish(Wishlist wish) {
        wish_repo.deleteById(wish.getId());
    }
    public int wishTotalRecord(WishPagingVO pvo, User user) {
        return wish_repo.countIdByUser(user);
    }
    public List<Wishlist> getAllWishList(WishPagingVO pvo, User user){
        return wish_repo.findAllByUserOrderByIdDesc(user, PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }

    public Follow selectFollow(Long from, Long to) {
        User userFrom = selectUser(from);
        User userTo = selectUser(to);
        return follow_repo.findByUserFromAndUserTo(userFrom, userTo);
    }

    public void insertFollow(Follow follow) {
        follow_repo.save(follow);
    }
    public void deleteFollow(Follow follow) {
        follow_repo.delete(follow);
    }

    public List<User> getFollowerList(Long id) {
        List<Follow> followerList = follow_repo.findByUserTo(selectUser(id));
        return followerList.stream()
                .map(Follow::getUserFrom)
                .collect(Collectors.toList());
    }

    public List<User> getFollowingList(Long id) {
        List<Follow> followerList = follow_repo.findByUserFrom(selectUser(id));
        return followerList.stream()
                .map(Follow::getUserTo)
                .collect(Collectors.toList());
    }
}
