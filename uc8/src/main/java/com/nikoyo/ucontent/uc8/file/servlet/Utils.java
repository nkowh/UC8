package com.nikoyo.ucontent.uc8.file.servlet;

import org.elasticsearch.common.netty.handler.codec.http.Cookie;
import org.elasticsearch.common.netty.handler.codec.http.CookieDecoder;
import org.elasticsearch.common.netty.handler.codec.http.HttpRequest;
import org.elasticsearch.common.netty.handler.codec.http.HttpResponse;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.FileNameMap;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.util.*;

import static org.elasticsearch.common.netty.handler.codec.http.HttpHeaders.Names.COOKIE;


public final class Utils {
    private Utils() {
        // Utils class
    }

    public static <T> Enumeration<T> emptyEnumeration() {
        return Collections.enumeration(Collections.<T>emptySet());
    }

    public static <T> Enumeration<T> enumeration(Collection<T> collection) {
        if (collection == null) {
            return emptyEnumeration();
        }
        return Collections.enumeration(collection);
    }

    public static <T> Enumeration<T> enumerationFromKeys(Map<T, ?> map) {
        if (map == null) {
            return emptyEnumeration();
        }
        return Collections.enumeration(map.keySet());
    }

    public static <T> Enumeration<T> enumerationFromValues(Map<?, T> map) {
        if (map == null) {
            return emptyEnumeration();
        }
        return Collections.enumeration(map.values());
    }


    /**
     * Parse the character encoding from the specified content type header. If
     * the content type is null, or there is no explicit character encoding,
     * <code>null</code> is returned.
     *
     * @param contentType a content type header
     */
    public static String getCharsetFromContentType(String contentType) {

        if (contentType == null) {
            return null;
        }
        int start = contentType.indexOf("charset=");
        if (start < 0) {
            return null;
        }
        String encoding = contentType.substring(start + 8);
        int end = encoding.indexOf(';');
        if (end >= 0) {
            encoding = encoding.substring(0, end);
        }
        encoding = encoding.trim();
        if ((encoding.length() > 2) && (encoding.startsWith("\""))
                && (encoding.endsWith("\""))) {
            encoding = encoding.substring(1, encoding.length() - 1);
        }
        return encoding.trim();

    }

    public static Collection<Cookie> getCookies(String name, HttpRequest request) {
        String cookieString = request.headers().get(COOKIE);
        if (cookieString != null) {
            List<Cookie> foundCookie = new ArrayList<Cookie>();
            Set<Cookie> cookies = new CookieDecoder().decode(cookieString);
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    foundCookie.add(cookie);
                }
            }

            return foundCookie;
        }
        return null;
    }

    public static Collection<Cookie> getCookies(String name,
                                                HttpResponse response) {
        String cookieString = response.headers().get(COOKIE);
        if (cookieString != null) {
            List<Cookie> foundCookie = new ArrayList<Cookie>();
            Set<Cookie> cookies = new CookieDecoder().decode(cookieString);
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    foundCookie.add(cookie);
                }
            }

            return foundCookie;
        }
        return null;
    }

    public static String getMimeType(String fileUrl) {
        FileNameMap fileNameMap = URLConnection.getFileNameMap();
        return fileNameMap.getContentTypeFor(fileUrl);
    }

    public static String sanitizeUri(String uri) {
        // Decode the path.
        try {
            uri = URLDecoder.decode(uri, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            try {
                uri = URLDecoder.decode(uri, "ISO-8859-1");
            } catch (UnsupportedEncodingException e1) {
                throw new Error();
            }
        }

        // Convert file separators.
        uri = uri.replace('/', File.separatorChar);

        // Simplistic dumb security check.
        // You will have to do something serious in the production environment.
        if (uri.contains(File.separator + ".")
                || uri.contains("." + File.separator) || uri.startsWith(".")
                || uri.endsWith(".")) {
            return null;
        }

        return uri;
    }

    public static Collection<Locale> parseAcceptLanguageHeader(
            String acceptLanguageHeader) {

        if (acceptLanguageHeader == null) {
            return null;
        }

        List<Locale> locales = new ArrayList<Locale>();

        for (String str : acceptLanguageHeader.split(",")) {
            String[] arr = str.trim().replace("-", "_").split(";");

            // Parse the locale
            Locale locale = null;
            String[] l = arr[0].split("_");
            switch (l.length) {
                case 2:
                    locale = new Locale(l[0], l[1]);
                    break;
                case 3:
                    locale = new Locale(l[0], l[1], l[2]);
                    break;
                default:
                    locale = new Locale(l[0]);
                    break;
            }

            locales.add(locale);
        }

        return locales;

    }


}