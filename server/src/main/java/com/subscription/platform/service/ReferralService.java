package com.subscription.platform.service;

import com.subscription.platform.entity.Referral;
import com.subscription.platform.entity.User;
import com.subscription.platform.exception.BadRequestException;
import com.subscription.platform.repository.ReferralRepository;
import com.subscription.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {

    private static final int REFERRAL_REWARD_CREDITS = 10;

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;

    @Transactional
    public void processReferral(String newUserId, String inviteCode) {
        if (referralRepository.existsByReferredId(newUserId)) {
            throw new BadRequestException("该用户已被推荐过");
        }

        User referrer = userRepository.findByInviteCode(inviteCode)
            .orElseThrow(() -> new BadRequestException("邀请码不存在: " + inviteCode));

        if (referrer.getId().equals(newUserId)) {
            throw new BadRequestException("不能使用自己的邀请码");
        }

        User referred = userRepository.findById(newUserId)
            .orElseThrow(() -> new BadRequestException("用户不存在"));

        Referral referral = new Referral();
        referral.setReferrer(referrer);
        referral.setReferred(referred);
        referral.setStatus("COMPLETED");
        referral.setReward(REFERRAL_REWARD_CREDITS);
        referralRepository.save(referral);

        userRepository.addCredits(referrer.getId(), REFERRAL_REWARD_CREDITS);
        referrer.setInvitedCount(referrer.getInvitedCount() + 1);
        userRepository.save(referrer);

        log.info("Referral processed: referrer={}, referred={}, reward={}", referrer.getId(), newUserId, REFERRAL_REWARD_CREDITS);
    }
}
