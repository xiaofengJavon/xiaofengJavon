package com.subscription.platform.config;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.api.impl.WxMaServiceImpl;
import cn.binarywang.wx.miniapp.config.impl.WxMaDefaultConfigImpl;
import com.github.binarywang.wxpay.config.WxPayConfig;
import com.github.binarywang.wxpay.service.WxPayService;
import com.github.binarywang.wxpay.service.impl.WxPayServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class WechatConfig {

    @Value("${wechat.miniapp.appid}")
    private String miniappAppid;

    @Value("${wechat.miniapp.secret}")
    private String miniappSecret;

    @Value("${wechat.pay.appid}")
    private String payAppid;

    @Value("${wechat.pay.mchid}")
    private String mchId;

    @Value("${wechat.pay.mch-key}")
    private String mchKey;

    @Value("${wechat.pay.notify-url}")
    private String notifyUrl;

    @Value("${wechat.pay.key-path}")
    private String keyPath;

    @Bean
    public WxMaService wxMaService() {
        WxMaDefaultConfigImpl config = new WxMaDefaultConfigImpl();
        config.setAppid(miniappAppid);
        config.setSecret(miniappSecret);
        WxMaService service = new WxMaServiceImpl();
        service.setWxMaConfig(config);
        return service;
    }

    @Bean
    public WxPayService wxPayService() {
        WxPayConfig config = new WxPayConfig();
        config.setAppId(payAppid);
        config.setMchId(mchId);
        config.setMchKey(mchKey);
        config.setNotifyUrl(notifyUrl);
        try {
            if (!keyPath.startsWith("classpath:")) {
                config.setKeyPath(keyPath);
            }
        } catch (Exception e) {
            log.warn("WeChat Pay key path not configured: {}", e.getMessage());
        }
        WxPayService service = new WxPayServiceImpl();
        service.setConfig(config);
        return service;
    }
}
