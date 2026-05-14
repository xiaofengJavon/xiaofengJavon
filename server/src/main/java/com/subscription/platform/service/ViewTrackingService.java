package com.subscription.platform.service;

import com.subscription.platform.entity.ReadArticle;
import com.subscription.platform.entity.ReadArticleId;
import com.subscription.platform.repository.ArticleRepository;
import com.subscription.platform.repository.ReadArticleRepository;
import com.subscription.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ViewTrackingService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final ReadArticleRepository readArticleRepository;

    @Async
    @Transactional
    public void saveReadHistory(String articleId, String userId) {
        try {
            ReadArticleId id = new ReadArticleId(userId, articleId);
            if (readArticleRepository.existsById(id)) return;
            articleRepository.findById(articleId).ifPresent(article ->
                userRepository.findById(userId).ifPresent(user -> {
                    ReadArticle record = new ReadArticle();
                    record.setId(id);
                    record.setUser(user);
                    record.setArticle(article);
                    readArticleRepository.save(record);
                })
            );
        } catch (Exception e) {
            log.warn("Failed to save read history for user={} article={}: {}", userId, articleId, e.getMessage());
        }
    }
}
