package com.nikoyo.ucontent.uc8.rest;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.Strings;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.index.VersionType;
import org.elasticsearch.rest.*;
import org.elasticsearch.rest.action.get.RestGetAction;
import org.elasticsearch.rest.action.support.RestActions;
import org.elasticsearch.rest.action.support.RestBuilderListener;
import org.elasticsearch.search.fetch.source.FetchSourceContext;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.elasticsearch.rest.RestStatus.NOT_FOUND;
import static org.elasticsearch.rest.RestStatus.OK;

public class GetAction extends RestGetAction {


    @Inject
    public GetAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
    }

    @Override
    public void handleRequest(final RestRequest request, final RestChannel channel, Client client) {
        if (!"documents".equalsIgnoreCase(request.param("index"))) {
            super.handleRequest(request, channel, client);
            return;
        }

        final GetRequest getRequest = new GetRequest(request.param("index"), request.param("type"), request.param("id"));
        getRequest.listenerThreaded(false);
        getRequest.operationThreaded(true);
        getRequest.refresh(request.paramAsBoolean("refresh", getRequest.refresh()));
        getRequest.routing(request.param("routing"));  // order is important, set it after routing, so it will set the routing
        getRequest.parent(request.param("parent"));
        getRequest.preference(request.param("preference"));
        getRequest.realtime(request.paramAsBoolean("realtime", null));
        getRequest.ignoreErrorsOnGeneratedFields(request.paramAsBoolean("ignore_errors_on_generated_fields", false));

        String sField = request.param("fields");
        if (sField != null) {
            String[] sFields = Strings.splitStringByCommaToArray(sField);
            if (sFields != null) {
                getRequest.fields(sFields);
            }
        }

        getRequest.version(RestActions.parseVersion(request));
        getRequest.versionType(VersionType.fromString(request.param("version_type"), getRequest.versionType()));

        getRequest.fetchSourceContext(FetchSourceContext.parseFromRestRequest(request));

        client.get(getRequest, new RestBuilderListener<GetResponse>(channel) {
            @Override
            public RestResponse buildResponse(GetResponse response, XContentBuilder builder) throws Exception {
                builder.startObject();
                response.toXContent(builder, request);
                builder.endObject();
                if (!response.isExists()) {
                    return new BytesRestResponse(NOT_FOUND, builder);
                } else if (Utils.hasPermission(builder, (String) request.getContext().get("principals"), "read")) {
                    return new BytesRestResponse(OK, builder);
                } else {
                    XContentBuilder result = channel.newBuilder();
                    result.startObject()
                            .field("_index", request.param("index"))
                            .field("_type", request.param("type"))
                            .field("_id", request.param("id"))
                            .field("found", false);
                    return new BytesRestResponse(RestStatus.NOT_FOUND, result);
                }
            }
        });
    }

}
