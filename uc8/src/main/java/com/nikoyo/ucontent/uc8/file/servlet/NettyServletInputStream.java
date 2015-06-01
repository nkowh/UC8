package com.nikoyo.ucontent.uc8.file.servlet;

import org.elasticsearch.common.netty.buffer.ChannelBufferInputStream;
import org.elasticsearch.common.netty.handler.codec.http.HttpRequest;

import javax.servlet.ServletInputStream;
import java.io.IOException;

public class NettyServletInputStream extends ServletInputStream {

    private final ChannelBufferInputStream inputStream;

    public NettyServletInputStream(HttpRequest request) {

        inputStream=new ChannelBufferInputStream(request.getContent());

    }

    @Override
    public int read() throws IOException {
        return inputStream.read();
    }

    @Override
    public int read(byte[] buf) throws IOException {
        return inputStream.read(buf);
    }

    @Override
    public int read(byte[] buf, int offset, int len) throws IOException {
        return inputStream.read(buf, offset, len);
    }

    public void close() throws IOException {
        inputStream.close();
    }

}