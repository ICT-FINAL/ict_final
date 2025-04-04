package com.ict.serv.repository;

import com.ict.serv.entity.user.Guestbook;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestbookRepository extends JpaRepository<Guestbook, Integer> {
}
