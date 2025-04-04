package com.ict.serv.entity.Inquiries;

import com.ict.serv.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
@Table(name="INQUIRIES")
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="inquiry_no")
    private Long id;

    @Column(name="inquiry_subject")
    private String inquirySubject;

    @Column(name="inquiry_type")
    private String inquiryType;

    @Column(name="inquiry_content", columnDefinition = "LONGTEXT")
    private String inquiryContent;

    @Column(name="inquiry_writedate", columnDefinition = "DATETIME")
    private String inquiryWritedate;

    @Column(name="inquiry_status")
    @Enumerated(EnumType.STRING)
    private InquiryState inquiryStatus;

    @Column(name="inquiry_enddate", columnDefinition = "DATETIME")
    private String inquiryEnddate; // 문의완료날짜

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
}
