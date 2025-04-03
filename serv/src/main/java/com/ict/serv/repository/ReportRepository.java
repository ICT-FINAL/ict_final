package com.ict.serv.repository;

import com.ict.serv.entity.report.Report;
import com.ict.serv.entity.report.ReportState;
import com.ict.serv.entity.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findAllByStateOrderByIdDesc(ReportState state, PageRequest pg);

    int countIdByState(ReportState state);

    int countIdByStateAndReportTypeContaining(ReportState state, String category);

    @Query("SELECT COUNT(r) FROM Report r " +
            "WHERE r.state = :state " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    int countIdByStateAndContainingSearchWord(@Param("state") ReportState state, @Param("searchWord") String searchWord);

    @Query("SELECT COUNT(r) FROM Report r " +
            "WHERE r.state = :state " +
            "AND r.reportType LIKE %:reportType% " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    int countIdByStateAndReportTypeContainingAndSearchWord(@Param("state") ReportState state, @Param("reportType") String reportType, @Param("searchWord") String searchWord);

    List<Report> findAllByStateAndReportTypeContainingOrderByIdDesc(ReportState state, String category, PageRequest of);
    @Query("SELECT r FROM Report r " +
            "WHERE r.state = :state " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    List<Report> findAllIdByStateAndContainingSearchWord(@Param("state") ReportState state, @Param("searchWord") String searchWord, PageRequest of);

    @Query("SELECT r FROM Report r " +
            "WHERE r.state = :state " +
            "AND r.reportType LIKE %:reportType% " +
            "AND (LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR CAST(r.id AS string) LIKE %:searchWord% " +
            "OR LOWER(r.reportUser.username) LIKE LOWER(CONCAT('%', :searchWord, '%')) " +
            "OR LOWER(r.userFrom.username) LIKE LOWER(CONCAT('%', :searchWord, '%')))")
    List<Report> findAllByStateAndReportTypeContainingAndSearchWord(@Param("state") ReportState state, @Param("reportType") String reportType, @Param("searchWord") String searchWord, PageRequest of);
    int countIdByReportUser(User user);

    List<Report> findAllByUserFromOrderByCreateDateDesc(User user, PageRequest of);

    int countIdByUserFrom(User user);
}
