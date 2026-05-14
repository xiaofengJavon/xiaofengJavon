package com.subscription.platform.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class HtmlUtil {

    private static final Safelist ALLOWED_TAGS = Safelist.relaxed()
        .addTags("p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
                 "ul", "ol", "li", "a", "img")
        .addAttributes("a", "href", "title")
        .addAttributes("img", "src", "alt", "width", "height")
        .addProtocols("a", "href", "http", "https")
        .addProtocols("img", "src", "http", "https");

    public static String sanitize(String html) {
        if (html == null) return null;
        return Jsoup.clean(html, ALLOWED_TAGS);
    }

    public static String stripTags(String html) {
        if (html == null) return null;
        return Jsoup.parse(html).text();
    }

    public static String generateSummary(String html, int maxLength) {
        String text = stripTags(html);
        if (text == null || text.isEmpty()) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    public static int calculateReadTime(String html) {
        String text = stripTags(html);
        if (text == null || text.isEmpty()) return 1;
        int charCount = text.length();
        int minutes = (int) Math.ceil((double) charCount / 400);
        return Math.max(1, minutes);
    }
}
