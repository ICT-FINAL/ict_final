package com.ict.serv.service;

import com.ict.serv.entity.event.Event;
import com.ict.serv.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository repo;
    public Event saveEvent(Event event) {
        return repo.save(event);
    }

    public List<Event> getAllEvent() {
        return repo.findAllByOrderByStartDateDesc();
    }
}
