package com.nikoyo.ucontent.elasticfile;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.ElasticsearchIllegalArgumentException;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.monitor.fs.FsService;
import org.elasticsearch.monitor.jvm.JvmMonitorService;
import org.elasticsearch.monitor.jvm.JvmService;
import org.elasticsearch.monitor.network.NetworkService;
import org.elasticsearch.monitor.os.OsService;
import org.elasticsearch.monitor.process.ProcessService;
import org.elasticsearch.rest.*;


import static org.elasticsearch.rest.RestRequest.Method.GET;
import static org.elasticsearch.rest.RestRequest.Method.POST;
import static org.elasticsearch.rest.RestStatus.OK;
import static org.elasticsearch.rest.RestStatus.NOT_FOUND;
import static org.elasticsearch.rest.RestStatus.OK;


public class Monitor extends BaseRestHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    private ProcessService processService;
    @Inject
    private OsService osService;
    @Inject
    private NetworkService networkService;
    @Inject
    private JvmService jvmService;
    @Inject
    private FsService fsService;
    @Inject
    private JvmMonitorService jvmMonitorService;

    @Inject
    public Monitor(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
        controller.registerHandler(POST, "/_monitor", this);
        controller.registerHandler(GET, "/_monitor", this);
    }

    @Override
    public void handleRequest(RestRequest request, RestChannel channel, Client client) throws Exception {
        XContentBuilder builder = channel.newBuilder();
        builder.startObject();
        osService.stats().toXContent(builder, null);
        builder.endObject();

        channel.sendResponse(new BytesRestResponse(OK, builder));
    }


}
