package com.nikoyo.ucontent.uc8.rest;

import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.rest.*;
import org.elasticsearch.rest.action.delete.RestDeleteAction;

import java.io.IOException;


public class DeleteAction extends RestDeleteAction {

    @Inject
    public DeleteAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
    }

    @Override
    public void handleRequest(RestRequest request, RestChannel channel, Client client) {
        if(!"documents".equalsIgnoreCase(request.param("index"))){
            super.handleRequest(request, channel, client);
            return;
        }
        if (Utils.hasWritePermission(request, client)) {
            super.handleRequest(request, channel, client);
        } else {
            try {
                Utils.sendForbidden(request, channel);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }


}
