package com.ict.serv.service;

import com.ict.serv.controller.admin.PagingVO;
import com.ict.serv.entity.product.Product;
import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.user.Guestbook;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.GuestbookRepository;
import com.ict.serv.repository.ReportRepository;
import com.ict.serv.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MypageService {
    private final ReportRepository report_repo;
    private final GuestbookRepository guestbook_repo;
    private final ProductRepository product_repo;

    public List<Report> getReportByUserFrom(User user, PagingVO pvo) {
        return report_repo.findAllByUserFromOrderByCreateDateDesc(user, PageRequest.of(pvo.getNowPage()-1, pvo.getOnePageRecord()));
    }
    public int totalReportRecord(User user){
        return report_repo.countIdByUserFrom(user);
    }

    public void insertGuestbook(Guestbook guestbook) {
        guestbook_repo.save(guestbook);
    }

    public List<Guestbook> selectGuestbookAll(User user) {
        return guestbook_repo.findAllByReceiver(user);
    }

    public Optional<Guestbook> selectGuestbookById(int id) {
        return guestbook_repo.findById(id);
    }

    public void deleteGuestbook(Guestbook guestbook) {
        guestbook_repo.delete(guestbook);
    }

    public List<Product> selectProductBySellerNo(Long id) {
        return product_repo.findAllBySellerNo_Id(id);
    }

    public List<Guestbook> selectReplyAll(int id) {
        return guestbook_repo.findAllByOriginalId(id);
    }
}
