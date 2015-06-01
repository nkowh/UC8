package com.nikoyo.ucontent.uc8.security;


import com.nikoyo.ucontent.uc8.security.authentication.basic.BasicFilter;
import org.elasticsearch.ElasticsearchException;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.component.AbstractLifecycleComponent;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.rest.RestController;

public class SecurityService extends AbstractLifecycleComponent<SecurityService> {


    private final RestController restController;
    private final Client client;

    @Inject
    public SecurityService(final Settings settings, final Client client,
                           final RestController restController) {
        super(settings);
        this.restController = restController;
        this.client = client;
    }

    @Override
    protected void doStart() throws ElasticsearchException {
        restController.registerFilter(new BasicFilter(client));
    }

    @Override
    protected void doStop() throws ElasticsearchException {

    }

    @Override
    protected void doClose() throws ElasticsearchException {

    }
}
