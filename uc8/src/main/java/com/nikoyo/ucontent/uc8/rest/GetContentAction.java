package com.nikoyo.ucontent.uc8.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikoyo.ucontent.uc8.file.FileSystem;
import com.nikoyo.ucontent.uc8.file.FileSystemFactory;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.rest.*;
import org.elasticsearch.rest.action.support.RestBuilderListener;

import java.util.List;
import java.util.Map;

import static org.elasticsearch.rest.RestRequest.Method.GET;
import static org.elasticsearch.rest.RestStatus.NOT_FOUND;
import static org.elasticsearch.rest.RestStatus.OK;

public class GetContentAction extends BaseRestHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final FileSystem FS;

    @Inject
    protected GetContentAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
        final FileSystemFactory fileSystemFactory = new FileSystemFactory(client);
        FS = fileSystemFactory.newFileSystem();
        controller.registerHandler(GET, "/documents/{type}/{id}/_content", this);
        controller.registerHandler(GET, "/documents/{type}/{id}/_content/{itemId}", this);
    }

    @Override
    public void handleRequest(final RestRequest request, RestChannel channel, Client client) {
        //Const.modifyRequestParams(request);
        final String itemId = request.param("itemId");
        final GetRequest getRequest = new GetRequest("documents", request.param("type"), request.param("id"));
        client.get(getRequest, new RestBuilderListener<GetResponse>(channel) {
            @Override
            public RestResponse buildResponse(GetResponse response, XContentBuilder builder) throws Exception {
                builder.startObject();
                response.toXContent(builder, request);
                builder.endObject();
                if (!response.isExists()) {
                    return new BytesRestResponse(NOT_FOUND, builder);
                } else {
                    Map result = objectMapper.readValue(builder.bytes().toUtf8(), Map.class);
                    Map map = (Map) result.get("_source");
                    List<Map> contents = (List<Map>) map.get("_contents");
                    if (contents != null && contents.size() > 0) {

                        Map content = findContent(contents, itemId);
                        if (content == null) return new BytesRestResponse(NOT_FOUND, builder);
                        String location = (String) content.get("location");
                        String contentType = (String) content.get("contentType");
                        return new BytesRestResponse(OK, contentType, FS.read(location));
                    } else {
                        return new BytesRestResponse(NOT_FOUND, builder);
                    }
                }
            }
        });


    }

    private Map findContent(List<Map> contents, String itemId) {
        Map getContent = null;
        for (Map content : contents) {
            if (!content.get("itemId").equals(itemId)) continue;
            else {
                getContent = content;
                break;
            }
        }
        return getContent;
    }
}
