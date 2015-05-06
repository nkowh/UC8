package com.nikoyo.ucontent.elasticfile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikoyo.ucontent.elasticfile.losf.BlockFile;
import com.nikoyo.ucontent.elasticfile.losf.BlockFileSystem;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.output.NullOutputStream;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.ElasticsearchIllegalArgumentException;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;


import org.elasticsearch.rest.*;
import org.elasticsearch.rest.action.index.RestIndexAction;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.*;
import java.util.zip.CRC32;
import java.util.zip.CheckedInputStream;

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
        String contentType = request.header("content-type");

        if (isMultipart(contentType)) {

            HttpServletRequest httpServletRequest = Const.convertToHttpRequest(request);
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

                Const.modifyRequestContent(request, objectMapper.writeValueAsString(metadata).getBytes());
            } catch (FileUploadException e) {
                throw new RuntimeException(e);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }


        super.handleRequest(request, channel, client);
    }


    private boolean isMultipart(String contentType) {
        return contentType.toLowerCase(Locale.ENGLISH).startsWith(ServletFileUpload.MULTIPART);
    }


}
