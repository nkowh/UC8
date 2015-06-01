package com.nikoyo.ucontent.uc8.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikoyo.ucontent.uc8.file.FileSystem;
import com.nikoyo.ucontent.uc8.file.FileSystemFactory;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.ElasticsearchIllegalArgumentException;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.collect.ImmutableList;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.rest.RestChannel;
import org.elasticsearch.rest.RestController;
import org.elasticsearch.rest.RestRequest;
import org.elasticsearch.rest.action.index.RestIndexAction;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.*;

import static org.elasticsearch.rest.RestRequest.Method.POST;
import static org.elasticsearch.rest.RestRequest.Method.PUT;


public class IndexAction extends RestIndexAction {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static FileSystem FS;

    @Inject
    public IndexAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
        final FileSystemFactory fileSystemFactory = new FileSystemFactory(client);
        FS = fileSystemFactory.newFileSystem();
        controller.registerHandler(POST, "/{index}/{type}/_content", this); // auto id creation
        controller.registerHandler(PUT, "/{index}/{type}/{id}/_content", this);
        controller.registerHandler(POST, "/{index}/{type}/{id}/_content", this);
    }

    @Override
    public void handleRequest(RestRequest request, RestChannel channel, Client client) {
        if (!"documents".equalsIgnoreCase(request.param("index"))) {
            super.handleRequest(request, channel, client);
            return;
        }
        String contentType = request.header("content-type");

        if (isMultipart(contentType)) {

            HttpServletRequest httpServletRequest = Utils.convertToHttpRequest(request);
            DiskFileItemFactory factory = new DiskFileItemFactory();
            factory.setSizeThreshold(1024 * 1024 * 100);
            ServletFileUpload upload = new ServletFileUpload(factory);
            try {

                List<FileItem> items = upload.parseRequest(httpServletRequest);
                Map metadata = null;

                for (FileItem item : items) {
                    if (item.getFieldName().equalsIgnoreCase("metadata")) {
                        metadata = objectMapper.readValue(item.getString("UTF-8"), Map.class);
                        break;
                    }
                }
                if (metadata == null) throw new ElasticsearchIllegalArgumentException("missing metadata");
                List<Map> contents = new ArrayList<Map>();
                for (FileItem item : items) {
                    if (StringUtils.isBlank(item.getName())) continue;
                    if (item.getFieldName().equalsIgnoreCase("metadata")) continue;
                    String location = FS.write(item.get());

                    Map<String, Object> contentMetadata = new HashMap<String, Object>();
                    contentMetadata.put("itemId", UUID.randomUUID().toString().replace("-", ""));
                    contentMetadata.put("contentType", item.getContentType());
                    contentMetadata.put("name", item.getName());
                    contentMetadata.put("size", item.getSize());
                    contentMetadata.put("location", location);
                    contents.add(contentMetadata);
                }
                if (contents.size() > 0) metadata.put("_contents", contents);

                Utils.modifyRequestContent(request, objectMapper.writeValueAsString(metadata).getBytes());
            } catch (FileUploadException e) {
                throw new RuntimeException(e);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        try {
            addPrincipals(request);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        super.handleRequest(request, channel, client);
    }

    private void addPrincipals(RestRequest request) throws IOException {
        final String principals = (String) request.getContext().get("principals");
        if (principals == null) return;
        Map metadata = objectMapper.readValue(request.content().array(), Map.class);
        metadata.put("_creator", principals);
        metadata.put("_creation_time", new Date());
        addAcl(principals, metadata);
        Utils.modifyRequestContent(request, objectMapper.writeValueAsString(metadata).getBytes());
    }

    private void addAcl(final String principals, Map metadata) {
        if (!metadata.containsKey("_acl")) {
            List<Map> acl = new ArrayList<Map>();
            metadata.put("_acl", acl);
            acl.add(new HashMap() {{
                put("principals", ImmutableList.of(principals));
                put("permission", ImmutableList.of("read", "write"));
            }});
        }
    }


    private boolean isMultipart(String contentType) {
        return contentType.toLowerCase(Locale.ENGLISH).startsWith(ServletFileUpload.MULTIPART);
    }


}
