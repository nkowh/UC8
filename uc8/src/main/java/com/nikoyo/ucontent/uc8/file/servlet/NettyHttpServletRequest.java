package com.nikoyo.ucontent.uc8.file.servlet;

import org.elasticsearch.common.netty.channel.ChannelHandlerContext;
import org.elasticsearch.common.netty.handler.codec.http.CookieDecoder;
import org.elasticsearch.common.netty.handler.codec.http.HttpHeaders;
import org.elasticsearch.common.netty.handler.codec.http.HttpRequest;
import org.elasticsearch.common.netty.handler.codec.http.QueryStringDecoder;
import org.elasticsearch.common.netty.handler.codec.rtsp.RtspHeaders;
import org.elasticsearch.common.netty.handler.ssl.SslHandler;

import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.SSLSession;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletInputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static org.elasticsearch.common.netty.handler.codec.http.HttpHeaders.Names.COOKIE;

public class NettyHttpServletRequest implements HttpServletRequest {

    private static final String SSL_CIPHER_SUITE_ATTRIBUTE = "javax.servlet.request.cipher_suite";
    private static final String SSL_PEER_CERT_CHAIN_ATTRIBUTE = "javax.servlet.request.X509Certificate";

    private static final Locale DEFAULT_LOCALE = Locale.getDefault();

    private URIParser uriParser;

    private HttpRequest originalRequest;


    private NettyServletInputStream inputStream;

    private BufferedReader reader;

    private QueryStringDecoder queryStringDecoder;

    private Map<String, Object> attributes = new ConcurrentHashMap<String, Object>();

    private String characterEncoding;

    private String contextPath;

    private ChannelHandlerContext channelHandlerContext;

    public NettyHttpServletRequest(HttpRequest request, String contextPath) {
        this.originalRequest = request;
        this.contextPath = contextPath;
        this.uriParser = new URIParser(contextPath);
        uriParser.parse(request.getUri());
        this.inputStream = new NettyServletInputStream(request);
        this.reader = new BufferedReader(new InputStreamReader(inputStream));
        this.queryStringDecoder = new QueryStringDecoder(request.getUri());

    }

    public NettyHttpServletRequest(HttpRequest request, String contextPath, ChannelHandlerContext ctx) {
        this.originalRequest = request;
        this.contextPath = contextPath;
        this.uriParser = new URIParser(contextPath);
        uriParser.parse(request.getUri());
        this.inputStream = new NettyServletInputStream(request);
        this.reader = new BufferedReader(new InputStreamReader(inputStream));
        this.queryStringDecoder = new QueryStringDecoder(request.getUri());
        // setup the SSL security attributes
        this.channelHandlerContext = ctx;
        SslHandler sslHandler = channelHandlerContext.getPipeline().get(SslHandler.class);
        if (sslHandler != null) {
            SSLSession session = sslHandler.getEngine().getSession();
            if (session != null) {
                attributes.put(SSL_CIPHER_SUITE_ATTRIBUTE, session.getCipherSuite());
                try {
                    attributes.put(SSL_PEER_CERT_CHAIN_ATTRIBUTE, session.getPeerCertificates());
                } catch (SSLPeerUnverifiedException ex) {
                    // do nothing here
                }
            }
        }
    }

    public HttpRequest getOriginalRequest() {
        return originalRequest;
    }

    public String getContextPath() {
        return contextPath;
    }

    public Cookie[] getCookies() {
        String cookieString = this.originalRequest.headers().get(COOKIE);
        if (cookieString != null) {
            CookieDecoder cookieDecoder = new CookieDecoder();
            Set<org.elasticsearch.common.netty.handler.codec.http.Cookie> cookies = cookieDecoder.decode(cookieString);
            if (!cookies.isEmpty()) {
                Cookie[] cookiesArray = new Cookie[cookies.size()];
                int indx = 0;
                for (org.elasticsearch.common.netty.handler.codec.http.Cookie c : cookies) {
                    Cookie cookie = new Cookie(c.getName(), c.getValue());
                    cookie.setComment(c.getComment());
                    cookie.setDomain(c.getDomain());
                    cookie.setMaxAge((int) c.getMaxAge());
                    cookie.setPath(c.getPath());
                    cookie.setSecure(c.isSecure());
                    cookie.setVersion(c.getVersion());
                    cookiesArray[indx] = cookie;
                    indx++;
                }
                return cookiesArray;

            }
        }
        return null;
    }

    public long getDateHeader(String name) {
        String longVal = getHeader(name);
        if (longVal == null) {
            return -1;
        }

        return Long.parseLong(longVal);
    }

    public String getHeader(String name) {
        return HttpHeaders.getHeader(this.originalRequest, name);
    }

    public Enumeration getHeaderNames() {
        return Utils.enumeration(this.originalRequest.headers().names());
    }

    public Enumeration getHeaders(String name) {
        return Utils.enumeration(this.originalRequest.headers().getAll(name));
    }

    public int getIntHeader(String name) {
        return HttpHeaders.getIntHeader(this.originalRequest, name, -1);
    }

    public String getMethod() {
        return this.originalRequest.getMethod().getName();
    }

    public String getQueryString() {
        return this.uriParser.getQueryString();
    }

    public String getRequestURI() {
        return this.uriParser.getRequestUri();
    }

    public StringBuffer getRequestURL() {
        StringBuffer url = new StringBuffer();
        String scheme = this.getScheme();
        int port = this.getServerPort();
        String urlPath = this.getRequestURI();


        url.append(scheme); // http, https
        url.append("://");
        url.append(this.getServerName());
        if (("http".equalsIgnoreCase(scheme) && port != 80)
                || ("https".equalsIgnoreCase(scheme) && port != 443)) {
            url.append(':');
            url.append(this.getServerPort());
        }

        url.append(urlPath);
        return url;
    }

    public int getContentLength() {
        return (int) HttpHeaders.getContentLength(this.originalRequest, -1);
    }

    public String getContentType() {
        return HttpHeaders.getHeader(this.originalRequest,
                HttpHeaders.Names.CONTENT_TYPE);
    }

    public ServletInputStream getInputStream() throws IOException {
        return this.inputStream;
    }

    public String getCharacterEncoding() {
        if (characterEncoding == null) {
            characterEncoding = Utils.getCharsetFromContentType(this.getContentType());
        }
        return this.characterEncoding;
    }

    public String getParameter(String name) {
        String[] values = getParameterValues(name);
        return values != null ? values[0] : null;
    }

    public Map getParameterMap() {
        return this.queryStringDecoder.getParameters();
    }

    public Enumeration getParameterNames() {
        return Utils.enumerationFromKeys(this.queryStringDecoder.getParameters());
    }

    public String[] getParameterValues(String name) {
        List<String> values = this.queryStringDecoder.getParameters().get(name);
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.toArray(new String[values.size()]);
    }

    public String getProtocol() {
        return this.originalRequest.getProtocolVersion().toString();
    }

    public Object getAttribute(String name) {
        if (attributes != null) {
            return this.attributes.get(name);
        }
        return null;
    }

    public Enumeration getAttributeNames() {
        return Utils.enumerationFromKeys(this.attributes);
    }

    public void removeAttribute(String name) {
        if (this.attributes != null) {
            this.attributes.remove(name);
        }
    }

    public void setAttribute(String name, Object o) {
        this.attributes.put(name, o);
    }

    public BufferedReader getReader() throws IOException {
        return this.reader;
    }

    public String getRequestedSessionId() {
        // doesn't implement it yet
        return null;
    }

    public HttpSession getSession() {
        // doesn't implement it yet
        return null;
    }

    public HttpSession getSession(boolean create) {
        // doesn't implement it yet
        return null;
    }

    public String getPathInfo() {
        return this.uriParser.getPathInfo();
    }

    public Locale getLocale() {
        String locale = HttpHeaders.getHeader(this.originalRequest,
                RtspHeaders.Names.ACCEPT_LANGUAGE, DEFAULT_LOCALE.toString());
        return new Locale(locale);
    }

    public String getRemoteAddr() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getRemoteAddress();
        return addr.getAddress().getHostAddress();
    }

    public String getRemoteHost() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getRemoteAddress();
        return addr.getHostName();
    }

    public int getRemotePort() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getRemoteAddress();
        return addr.getPort();
    }

    public String getServerName() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getLocalAddress();
        return addr.getHostName();
    }

    public int getServerPort() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getLocalAddress();
        return addr.getPort();
    }

    public String getServletPath() {
        String servletPath = this.uriParser.getServletPath();
        if ("/".equals(servletPath)) {
            return "";
        }
        return servletPath;
    }

    public String getScheme() {
        return this.isSecure() ? "https" : "http";
    }

    public boolean isSecure() {
        return ChannelThreadLocal.get().getPipeline().get(SslHandler.class) != null;
    }

    public boolean isRequestedSessionIdFromCookie() {
        return true;
    }

    public String getLocalAddr() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getLocalAddress();
        return addr.getAddress().getHostAddress();
    }

    public String getLocalName() {
        return getServerName();
    }

    public int getLocalPort() {
        return getServerPort();
    }

    public void setCharacterEncoding(String env)
            throws UnsupportedEncodingException {
        this.characterEncoding = env;
    }

    public Enumeration getLocales() {
        Collection<Locale> locales = Utils
                .parseAcceptLanguageHeader(HttpHeaders
                        .getHeader(this.originalRequest,
                                HttpHeaders.Names.ACCEPT_LANGUAGE));

        if (locales == null || locales.isEmpty()) {
            locales = new ArrayList<Locale>();
            locales.add(Locale.getDefault());
        }
        return Utils.enumeration(locales);
    }

    public String getAuthType() {
        // CXF Calls this method to cache the Request informaiton
        return null;
    }

    public String getPathTranslated() {
        // CXF Calls this method to cache the Request informaiton
        return null;
    }

    public String getRemoteUser() {
        // CXF Calls this method to cache the Request informaiton
        return null;
    }

    public Principal getUserPrincipal() {
        // CXF will call this method to setup user information for Authentication
        return null;
    }

    public boolean isRequestedSessionIdFromURL() {
        throw new IllegalStateException(
                "Method 'isRequestedSessionIdFromURL' not yet implemented!");
    }

    public boolean isRequestedSessionIdFromUrl() {
        throw new IllegalStateException(
                "Method 'isRequestedSessionIdFromUrl' not yet implemented!");
    }

    public boolean isRequestedSessionIdValid() {
        return false;
    }

    public boolean isUserInRole(String role) {
        throw new IllegalStateException(
                "Method 'isUserInRole' not yet implemented!");
    }

    public String getRealPath(String path) {
        throw new IllegalStateException(
                "Method 'getRealPath' not yet implemented!");
    }

    public RequestDispatcher getRequestDispatcher(String path) {
        throw new IllegalStateException(
                "Method 'getRequestDispatcher' not yet implemented!");
    }
}