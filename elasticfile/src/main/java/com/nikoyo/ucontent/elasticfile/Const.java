package com.nikoyo.ucontent.elasticfile;


import com.nikoyo.ucontent.elasticfile.servlet.NettyHttpServletRequest;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.elasticsearch.common.bytes.BytesArray;
import org.elasticsearch.http.netty.NettyHttpRequest;
import org.elasticsearch.rest.RestRequest;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.util.Map;
import java.util.Properties;

public class Const {
    public static final String PREFIX = "_uc";
    public static final String INDEX = "files";
    public static final String TYPE = "name";


    static Field paramsField;
    static Field contentField;

    static {
        try {
            paramsField = NettyHttpRequest.class.getDeclaredField("params");
            paramsField.setAccessible(true);
            contentField = NettyHttpRequest.class.getDeclaredField("content");
            contentField.setAccessible(true);

        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }


    public static void modifyRequestParams(RestRequest request) {
        try {
            Map<String, String> map = (Map<String, String>) paramsField.get(request);
            map.put("index", Const.INDEX);
            map.put("type", Const.TYPE);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    public static void modifyRequestContent(RestRequest request, byte[] content) {
        try {
            contentField.set(request, new BytesArray(content));
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }


    public static HttpServletRequest convertToHttpRequest(RestRequest request) {
        try {

            Field field = NettyHttpRequest.class.getDeclaredField("request");
            field.setAccessible(true);
            org.elasticsearch.common.netty.handler.codec.http.HttpRequest nettyRequest = (org.elasticsearch.common.netty.handler.codec.http.HttpRequest) field.get(request);

            return new NettyHttpServletRequest(nettyRequest, request.path());
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
          }
    }


}
