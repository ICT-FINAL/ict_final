package com.ict.serv.service;

import com.ict.serv.entity.event.Event;
import com.ict.serv.entity.event.Melon;
import com.ict.serv.repository.EventRepository;
import com.ict.serv.repository.MelonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository repo;
    private final MelonRepository melonRepository;

    public Event saveEvent(Event event) {
        return repo.save(event);
    }

    public List<Event> getAllEvent() {
        return repo.findAllByOrderByStartDateDesc();
    }

    public Melon saveMelon(Melon melon) {
        return melonRepository.save(melon);
    }

    public List<Melon> getMelonList(){
        return melonRepository.findByTodayOrderByScoreDesc();
    }
}
