package com.subscription.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subscription.platform.dto.request.ChatRequest;
import com.subscription.platform.dto.response.ChatResponse;
import com.subscription.platform.exception.InsufficientCreditsException;
import com.subscription.platform.exception.ResourceNotFoundException;
import com.subscription.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.base-url}")
    private String geminiBaseUrl;

    @Value("${ai.gemini.model}")
    private String geminiModel;

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ChatResponse chat(String userId, ChatRequest request) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getCredits() <= 0) {
            throw new InsufficientCreditsException("积分不足，请通过邀请好友获取更多积分");
        }

        String sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID().toString();
        String reply;

        try {
            reply = callGeminiApi(request.getMessage());
            userRepository.deductCredits(userId, 1);
        } catch (InsufficientCreditsException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI service error: {}", e.getMessage());
            reply = "AI助手暂时不可用，请稍后重试";
        }

        int creditsRemaining = userRepository.findById(userId)
            .map(u -> u.getCredits())
            .orElse(0);

        return ChatResponse.builder()
            .reply(reply)
            .creditsRemaining(creditsRemaining)
            .sessionId(sessionId)
            .build();
    }

    private String callGeminiApi(String message) {
        RestTemplate restTemplate = new RestTemplate();
        String url = geminiBaseUrl + "/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", message))
            ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText("AI暂时无法回复");
            } catch (Exception e) {
                log.error("Failed to parse Gemini response: {}", e.getMessage());
                return "AI响应解析失败，请重试";
            }
        }
        throw new RuntimeException("Gemini API调用失败");
    }
}
