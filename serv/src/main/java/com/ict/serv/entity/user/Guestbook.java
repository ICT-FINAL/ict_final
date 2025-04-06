package com.ict.serv.entity.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Guestbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name="writer_no")
    private User writer;


    @Column(nullable = false)
    private String content;

    @CreationTimestamp
    @Column(columnDefinition="DATETIME default now()")
    private String writedate;
}
