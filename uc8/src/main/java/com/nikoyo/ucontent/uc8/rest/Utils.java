package com.nikoyo.ucontent.uc8.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikoyo.ucontent.uc8.file.servlet.NettyHttpServletRequest;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.bytes.BytesArray;
import org.elasticsearch.common.collect.ImmutableList;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.http.netty.NettyHttpRequest;
import org.elasticsearch.rest.BytesRestResponse;
import org.elasticsearch.rest.RestChannel;
import org.elasticsearch.rest.RestRequest;
import org.elasticsearch.rest.RestStatus;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.zip.CRC32;

public abstract class Utils {


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


    public static boolean hasPermission(final XContentBuilder builder, String principals, String permission) throws IOException {
        final ObjectMapper objectMapper = new ObjectMapper();
        Map result = objectMapper.readValue(builder.string(), Map.class);
        Map _source = (Map) result.get("_source");
        return hasPermission(_source, ImmutableList.of(principals), permission);
    }

    public static boolean hasPermission(final Map _source, String principals, String permission) throws IOException {
        return hasPermission(_source, ImmutableList.of(principals), permission);
    }

    public static boolean hasPermission(final Map _source, Collection<String> principals, String permission) throws IOException {
        List<Map> _acl = (List<Map>) _source.get("_acl");
        if (_acl == null) return true;
        for (Map ace : _acl) {
            List<String> principalsList = (List<String>) ace.get("principals");
            List<String> permissionList = (List<String>) ace.get("permission");
            if(principalsList==null || permissionList==null)
                throw new RuntimeException("acl format is not correct");
            if (containsOne(principalsList, principals) && permissionList.contains(permission))
                return true;
        }
        return false;
    }

    public static boolean hasWritePermission(RestRequest request, Client client) {
        try {
            final GetRequest getRequest = new GetRequest(request.param("index"), request.param("type"), request.param("id"));
            getRequest.listenerThreaded(false);
            getRequest.operationThreaded(true);
            GetResponse response = client.get(getRequest).get();
            if (response.isExists() && Utils.hasPermission(response.getSource(), (String) request.getContext().get("principals"), "write"))
                return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return false;
    }

    public static void sendForbidden(RestRequest request, RestChannel channel) throws IOException {
        XContentBuilder builder = channel.newBuilder().startObject()
                .field("_index", request.param("index"))
                .field("_type", request.param("type"))
                .field("_id", request.param("id")).endObject();
        channel.sendResponse(new BytesRestResponse(RestStatus.FORBIDDEN, builder));
    }


    private static boolean containsOne(Collection<String> collection1, Collection<String> collection2) {
        for (String s2 : collection2) {
            if (collection1.contains(s2))
                return true;
        }
        return false;
    }

    public static String checksumCRC32(byte[] buffer) throws IOException {
        CRC32 crc = new CRC32();
        crc.update(buffer);
        return String.format("%08X", crc.getValue());
    }
}
