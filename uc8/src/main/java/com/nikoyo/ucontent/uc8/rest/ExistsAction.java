package com.nikoyo.ucontent.uc8.rest;

import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.rest.RestChannel;
import org.elasticsearch.rest.RestController;
import org.elasticsearch.rest.RestRequest;
import org.elasticsearch.rest.action.exists.RestExistsAction;


public class ExistsAction extends RestExistsAction {

    @Inject
    public ExistsAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
    }

    @Override
    public void handleRequest(RestRequest request, RestChannel channel, Client client) {
        super.handleRequest(request, channel, client);
    }
}
