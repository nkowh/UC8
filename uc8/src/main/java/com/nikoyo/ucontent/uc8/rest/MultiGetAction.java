package com.nikoyo.ucontent.uc8.rest;

import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.rest.RestChannel;
import org.elasticsearch.rest.RestController;
import org.elasticsearch.rest.RestRequest;
import org.elasticsearch.rest.action.get.RestMultiGetAction;

public class MultiGetAction extends RestMultiGetAction {

    @Inject
    public MultiGetAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
    }

    @Override
    public void handleRequest(RestRequest request, RestChannel channel, Client client) throws Exception {
        super.handleRequest(request, channel, client);
    }
}
