package com.nikoyo.ucontent.elasticfile;


import com.nikoyo.ucontent.elasticfile.GetContentAction;
import com.nikoyo.ucontent.elasticfile.GetContentInfoAction;
import com.nikoyo.ucontent.elasticfile.IndexAction;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.plugins.AbstractPlugin;
import org.elasticsearch.rest.RestModule;

import static org.elasticsearch.common.collect.Lists.newArrayList;

public class Plugin extends AbstractPlugin {


    @Inject
    public Plugin() {
    }

    @Override
    public String name() {
        return "uContent file plugin";
    }

    @Override
    public String description() {
        return "uContent file plugin";
    }

    public void onModule(RestModule module) {

        module.addRestAction(IndexAction.class);
        module.addRestAction(GetContentAction.class);
        module.addRestAction(GetContentInfoAction.class);

    }

}
