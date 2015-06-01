package com.nikoyo.ucontent.uc8.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.rest.RestChannel;
import org.elasticsearch.rest.RestController;
import org.elasticsearch.rest.RestRequest;
import org.elasticsearch.rest.action.search.RestSearchAction;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SearchAction extends RestSearchAction {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    public SearchAction(Settings settings, RestController controller, Client client) {
        super(settings, controller, client);
    }

    @Override
    public void handleRequest(RestRequest request, RestChannel channel, Client client) {
        if(!"documents".equalsIgnoreCase(request.param("index"))){
            super.handleRequest(request, channel, client);
            return;
        }
        try {
            final String principals = (String) request.getContext().get("principals");
            Map query = request.content().length() == 0 ? createAclFilter(principals) : appendAclFilter(objectMapper.readValue(request.content().toUtf8(), Map.class), principals);
            Utils.modifyRequestContent(request, objectMapper.writeValueAsString(query).getBytes());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        super.handleRequest(request, channel, client);
    }

    private Map createAclFilter(final String principals) throws IOException {
        Map query = new HashMap();
        return appendAclFilter(query, principals);
    }

    private Map appendAclFilter(Map query, final String principals) throws IOException {
        List<Map> andCondition = new ArrayList<Map>();
        Map andFilter = new HashMap();
        andFilter.put("and", andCondition);
        query.put("filter", andFilter);

        Map acl = new HashMap();
        Map nested = new HashMap();
        acl.put("nested", nested);
        nested.put("path", "_acl");
        Map nestedFilter = new HashMap();
        Map nestedBool = new HashMap();
        nested.put("filter", nestedFilter);
        nestedFilter.put("bool", nestedBool);
        List<Map> nestedBoolMust = new ArrayList<Map>();
        nestedBool.put("must", nestedBoolMust);
        Map permissionsPart = new HashMap();
        final Map principalsPart = new HashMap();
        principalsPart.put("term", new HashMap() {{
            put("_acl.principals", principals);
        }});
        permissionsPart.put("term", new HashMap() {{
            put("_acl.permission", "read");
        }});
        nestedBoolMust.add(permissionsPart);
        nestedBoolMust.add(principalsPart);
        andCondition.add(acl);
        return query;
    }
}
