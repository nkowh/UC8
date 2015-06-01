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
import org.elasticsearch.common.xcontent.json.JsonXContent;
import org.elasticsearch.rest.*;
import org.elasticsearch.rest.action.support.RestBuilderListener;

import java.util.List;
import java.util.Map;

import static org.elasticsearch.rest.RestRequest.Method.GET;
import static org.elasticsearch.rest.RestStatus.NOT_FOUND;
import static org.elasticsearch.rest.RestStatus.OK;

public class GetContentInfoAction extends BaseRestHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final FileSystem FS;

    @Inject
    protected GetContentInfoAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
        final FileSystemFactory fileSystemFactory = new FileSystemFactory(client);
        FS = fileSystemFactory.newFileSystem();
        controller.registerHandler(GET, "/documents/{type}/{id}/_content/info", this);
    }

    @Override
    public void handleRequest(final RestRequest request, RestChannel channel, Client client) {

        final int num = request.param("num") == null ? 0 : Integer.parseInt(request.param("num"));
        final GetRequest getRequest = new GetRequest(request.param("index"), request.param("type"), request.param("id"));
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
                    if (contents != null && contents.size() >= 0) {
                        //Map content = contents.get(num);
                        XContentBuilder resultBuilder = JsonXContent.contentBuilder();
                        resultBuilder.startObject().field("count", contents.size());

                        resultBuilder.endObject();

                        return new BytesRestResponse(OK, resultBuilder);
                    } else {

                        return new BytesRestResponse(NOT_FOUND, builder);
                    }
                }
            }
        });


    }
}
