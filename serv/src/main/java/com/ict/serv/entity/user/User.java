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

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name="user_name")
    private String username;

    @Column(name="user_pw", nullable = false)
    private String userpw;

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

    public String getProfileImageUrl() {
        return (uploadedProfileUrl != null && !uploadedProfileUrl.trim().isEmpty())
                ? uploadedProfileUrl.trim()
                : (kakaoProfileUrl != null ? kakaoProfileUrl.trim() : null);
    }
}