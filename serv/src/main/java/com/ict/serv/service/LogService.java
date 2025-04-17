package com.ict.serv.service;

import com.ict.serv.entity.log.search.KeywordDTO;
import com.ict.serv.entity.log.search.SearchLog;
import com.ict.serv.entity.user.User;
import com.ict.serv.repository.log.SearchLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LogService {
    private final SearchLogRepository searchLogRepository;
    private Map<String, Integer> previousRankMap = new HashMap<>();

    public void saveSearch(User user, String ip, String keyword, String ec, String tc, String pc, LocalDateTime limit){
        if (isBlank(keyword) && isBlank(ec) && isBlank(tc) && isBlank(pc)) {
            return;
        }
        if (!isValidKeyword(keyword)) return;
        boolean exists = searchLogRepository.findRecentDuplicate(user, ip, keyword, ec, tc, pc, limit).isPresent();

        if (!exists) {
            SearchLog log = new SearchLog();
            log.setUser(user);
            log.setIp(user == null ? ip : null);
            log.setSearchWord(keyword);
            log.setEventCategory(ec);
            log.setTargetCategory(tc);
            log.setProductCategory(pc);
            searchLogRepository.save(log);
        }
    }
    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    public List<KeywordDTO> getRealtimeKeywordRank(int hours, int topN) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        Pageable pageable = PageRequest.of(0, topN);

        List<Object[]> result = searchLogRepository.findTopKeywords(since, pageable);
        List<KeywordDTO> ranks = new ArrayList<>();

        int rank = 1;
        Map<String, Integer> currentRankMap = new HashMap<>();

        for (Object[] row : result) {
            String keyword = (String) row[0];
            Long count = (Long) row[1];
            currentRankMap.put(keyword, rank);

            // 순위 변동 계산
            Integer prevRank = previousRankMap.get(keyword);
            Object change;
            if (prevRank == null) {
                change = "NEW";  // 새로 등장한 키워드
            } else {
                change = prevRank - rank; // +: 상승, -: 하락
            }

            ranks.add(new KeywordDTO(keyword, count, change));
            rank++;
        }

        // 이전 순위 맵 업데이트
        previousRankMap = currentRankMap;

        return ranks;
    }

    public boolean isValidKeyword(String keyword) {
        if (keyword == null || keyword.trim().length() < 2) return false;
        String pattern = "^[가-힣a-zA-Z0-9\\s]{2,}$";
        if (!keyword.matches(pattern)) return false;
        if (keyword.matches(".*(.)\\1{3,}.*")) return false;
        return true;
    }
}
