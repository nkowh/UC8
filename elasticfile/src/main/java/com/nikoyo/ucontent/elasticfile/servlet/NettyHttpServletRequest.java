package com.nikoyo.ucontent.elasticfile.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.net.ssl.SSLPeerUnverifiedException;
import javax.net.ssl.SSLSession;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletInputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.elasticsearch.common.netty.handler.codec.http.HttpHeaders;
import org.elasticsearch.common.netty.handler.codec.http.HttpRequest;
import org.elasticsearch.common.netty.channel.ChannelHandlerContext;

import org.elasticsearch.common.netty.handler.codec.http.CookieDecoder;


import org.elasticsearch.common.netty.handler.codec.http.QueryStringDecoder;
import org.elasticsearch.common.netty.handler.codec.rtsp.RtspHeaders;
import org.elasticsearch.common.netty.handler.ssl.SslHandler;


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

    public NettyHttpServletRequest(HttpRequest request,String contextPath) {
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

    @Override
    public String getContextPath() {
        return contextPath;
    }

    @Override
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

    @Override
    public long getDateHeader(String name) {
        String longVal = getHeader(name);
        if (longVal == null) {
            return -1;
        }

        return Long.parseLong(longVal);
    }

    @Override
    public String getHeader(String name) {
        return HttpHeaders.getHeader(this.originalRequest, name);
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Enumeration getHeaderNames() {
        return Utils.enumeration(this.originalRequest.headers().names());
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Enumeration getHeaders(String name) {
        return Utils.enumeration(this.originalRequest.headers().getAll(name));
    }

    @Override
    public int getIntHeader(String name) {
        return HttpHeaders.getIntHeader(this.originalRequest, name, -1);
    }

    @Override
    public String getMethod() {
        return this.originalRequest.getMethod().getName();
    }

    @Override
    public String getQueryString() {
        return this.uriParser.getQueryString();
    }

    @Override
    public String getRequestURI() {
        return this.uriParser.getRequestUri();
    }

    @Override
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

    @Override
    public int getContentLength() {
        return (int) HttpHeaders.getContentLength(this.originalRequest, -1);
    }

    @Override
    public String getContentType() {
        return HttpHeaders.getHeader(this.originalRequest,
                HttpHeaders.Names.CONTENT_TYPE);
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        return this.inputStream;
    }

    @Override
    public String getCharacterEncoding() {
        if (characterEncoding == null) {
            characterEncoding = Utils.getCharsetFromContentType(this.getContentType());
        }
        return this.characterEncoding;
    }

    @Override
    public String getParameter(String name) {
        String[] values = getParameterValues(name);
        return values != null ? values[0] : null;
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Map getParameterMap() {
        return this.queryStringDecoder.getParameters();
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Enumeration getParameterNames() {
        return Utils.enumerationFromKeys(this.queryStringDecoder.getParameters());
    }

    @Override
    public String[] getParameterValues(String name) {
        List<String> values = this.queryStringDecoder.getParameters().get(name);
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.toArray(new String[values.size()]);
    }

    @Override
    public String getProtocol() {
        return this.originalRequest.getProtocolVersion().toString();
    }

    @Override
    public Object getAttribute(String name) {
        if (attributes != null) {
            return this.attributes.get(name);
        }
        return null;
    }

    @SuppressWarnings("rawtypes")
    @Override
    public Enumeration getAttributeNames() {
        return Utils.enumerationFromKeys(this.attributes);
    }

    @Override
    public void removeAttribute(String name) {
        if (this.attributes != null) {
            this.attributes.remove(name);
        }
    }

    @Override
    public void setAttribute(String name, Object o) {
        this.attributes.put(name, o);
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return this.reader;
    }

    @Override
    public String getRequestedSessionId() {
        // doesn't implement it yet
        return null;
    }

    @Override
    public HttpSession getSession() {
        // doesn't implement it yet
        return null;
    }

    @Override
    public HttpSession getSession(boolean create) {
        // doesn't implement it yet
        return null;
    }

    @Override
    public String getPathInfo() {
        return this.uriParser.getPathInfo();
    }

    @Override
    public Locale getLocale() {
        String locale = HttpHeaders.getHeader(this.originalRequest,
                RtspHeaders.Names.ACCEPT_LANGUAGE, DEFAULT_LOCALE.toString());
        return new Locale(locale);
    }

    @Override
    public String getRemoteAddr() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getRemoteAddress();
        return addr.getAddress().getHostAddress();
    }

    @Override
    public String getRemoteHost() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getRemoteAddress();
        return addr.getHostName();
    }

    @Override
    public int getRemotePort() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getRemoteAddress();
        return addr.getPort();
    }

    @Override
    public String getServerName() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getLocalAddress();
        return addr.getHostName();
    }

    @Override
    public int getServerPort() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getLocalAddress();
        return addr.getPort();
    }

    @Override
    public String getServletPath() {
        String servletPath = this.uriParser.getServletPath();
        if ("/".equals(servletPath)) {
            return "";
        }
        return servletPath;
    }

    @Override
    public String getScheme() {
        return this.isSecure() ? "https" : "http";
    }

    @Override
    public boolean isSecure() {
        return ChannelThreadLocal.get().getPipeline().get(SslHandler.class) != null;
    }

    @Override
    public boolean isRequestedSessionIdFromCookie() {
        return true;
    }

    @Override
    public String getLocalAddr() {
        InetSocketAddress addr = (InetSocketAddress) ChannelThreadLocal.get().getLocalAddress();
        return addr.getAddress().getHostAddress();
    }

    @Override
    public String getLocalName() {
        return getServerName();
    }

    @Override
    public int getLocalPort() {
        return getServerPort();
    }

    @Override
    public void setCharacterEncoding(String env)
            throws UnsupportedEncodingException {
        this.characterEncoding = env;
    }

    @SuppressWarnings("rawtypes")
    @Override
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

    @Override
    public String getAuthType() {
        // CXF Calls this method to cache the Request informaiton
        return null;
    }

    @Override
    public String getPathTranslated() {
        // CXF Calls this method to cache the Request informaiton
        return null;
    }

    @Override
    public String getRemoteUser() {
        // CXF Calls this method to cache the Request informaiton
        return null;
    }

    @Override
    public Principal getUserPrincipal() {
        // CXF will call this method to setup user information for Authentication
        return null;
    }

    @Override
    public boolean isRequestedSessionIdFromURL() {
        throw new IllegalStateException(
                "Method 'isRequestedSessionIdFromURL' not yet implemented!");
    }

    @Override
    public boolean isRequestedSessionIdFromUrl() {
        throw new IllegalStateException(
                "Method 'isRequestedSessionIdFromUrl' not yet implemented!");
    }

    @Override
    public boolean isRequestedSessionIdValid() {
        return false;
    }

    @Override
    public boolean isUserInRole(String role) {
        throw new IllegalStateException(
                "Method 'isUserInRole' not yet implemented!");
    }

    @Override
    public String getRealPath(String path) {
        throw new IllegalStateException(
                "Method 'getRealPath' not yet implemented!");
    }

    @Override
    public RequestDispatcher getRequestDispatcher(String path) {
        throw new IllegalStateException(
                "Method 'getRequestDispatcher' not yet implemented!");
    }
}