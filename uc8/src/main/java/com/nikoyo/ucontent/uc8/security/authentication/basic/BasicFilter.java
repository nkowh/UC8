package com.nikoyo.ucontent.uc8.security.authentication.basic;


import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.Base64;
import org.elasticsearch.common.logging.ESLogger;
import org.elasticsearch.common.logging.Loggers;
import org.elasticsearch.rest.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;

public class BasicFilter extends RestFilter {

    private static Map<String, String> sessionMap = new HashMap<String, String>();
    private ESLogger logger = Loggers.getLogger(BasicFilter.class);
    private final Client client;


    public BasicFilter(Client client) {
        this.client = client;
    }

    @Override
    public void process(RestRequest request, RestChannel channel, RestFilterChain filterChain) throws Exception {
        if (request.method() == RestRequest.Method.OPTIONS
                || request.path().startsWith("/_plugin/")
                || sessionAuth(request)
                || paramsAuth(request)
                || basicAuth(request)
                ) {
            filterChain.continueProcessing(request, channel);
        } else {
            BytesRestResponse response = new BytesRestResponse(RestStatus.UNAUTHORIZED, "Authentication Required");
            response.addHeader("WWW-Authenticate", "Basic realm=\"Restricted\"");
            channel.sendResponse(response);
        }
    }

    private boolean sessionAuth(final RestRequest request) {
        String session = request.param("session");
        if (session == null) session = request.header("session");
        if (session != null && sessionMap.containsKey(session)) {
            request.putInContext("principals", sessionMap.get(session));
            return true;
        }
        return false;
    }

    private boolean paramsAuth(final RestRequest request) {
        String username = request.param("username");
        String password = request.param("password");
        if (auth(username, password)) {
            request.putInContext("principals", username.toLowerCase());
            sessionMap.put(Base64.encodeBytes((username + ":" + password).getBytes()), username.toLowerCase());
            return true;
        }
        return false;
    }

    private boolean basicAuth(final RestRequest request) {
        String decoded = getDecoded(request);
        if (decoded.isEmpty()) return false;
        String[] userAndPassword = decoded.split(":", 2);
        String username = userAndPassword[0];
        String password = userAndPassword[1];

        if (auth(username, password)) {
            request.putInContext("principals", username.toLowerCase());
            sessionMap.put(Base64.encodeBytes((username + ":" + password).getBytes()), username.toLowerCase());
            return true;
        }
        return false;
    }

    private boolean auth(String username, String password) {
        try {
            final GetRequest getRequest = new GetRequest("system", "users", username);
            getRequest.listenerThreaded(false);
            getRequest.operationThreaded(true);
            GetResponse response = client.get(getRequest).get();

            Boolean found = response.isExists();
            if (found && password.equals(response.getSource().get("password")))
                return true;
        } catch (Exception e) {
            logger.warn("Retrieving of user and password failed " + e.getMessage());
        }
        return false;
    }


    private String getDecoded(RestRequest request) {
        String authHeader = request.header("Authorization");
        if (authHeader == null)
            return "";

        String[] split = authHeader.split(" ", 2);
        if (split.length != 2 || !split[0].equals("Basic"))
            return "";
        try {
            return new String(Base64.decode(split[1]));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }
}
