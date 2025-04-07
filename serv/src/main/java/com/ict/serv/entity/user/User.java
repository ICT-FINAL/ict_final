package com.ict.serv.entity.user;

import com.ict.serv.entity.Authority;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
@Entity
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable = false, unique = true)
    private String userid;

    @Column(name="user_name")
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name="user_pw", nullable = false)
    private String userpw;

    @Column(nullable = false)
    private String tel;

    @Column(nullable = false)
    private String address;

    @Column(name="address_detail", nullable = false)
    private String addressDetail;

    @Column(nullable = false)
    private String zipcode;

    @Column(name="info_text")
    private String infoText;

    @Column
    @Enumerated(EnumType.STRING)
    private Authority authority;

    @Column(name="kakao_profile_url")
    private String kakaoProfileUrl;

    @Column(name="uploaded_profile_url")
    private String uploadedProfileUrl;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime modifiedDate;

    @Column(columnDefinition = "int default 0")
    private int grade;

    @Column(name="grade_point", columnDefinition = "int default 0")
    private int gradePoint;

    public String getProfileImageUrl() {
        return (uploadedProfileUrl != null && !uploadedProfileUrl.trim().isEmpty())
                ? uploadedProfileUrl.trim()
                : (kakaoProfileUrl != null ? kakaoProfileUrl.trim() : null);
    }
}