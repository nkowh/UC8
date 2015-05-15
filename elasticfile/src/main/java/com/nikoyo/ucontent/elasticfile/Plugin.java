package com.nikoyo.ucontent.elasticfile;


import com.nikoyo.ucontent.elasticfile.GetContentAction;
import com.nikoyo.ucontent.elasticfile.GetContentInfoAction;
import com.nikoyo.ucontent.elasticfile.IndexAction;
import org.elasticsearch.common.collect.ImmutableList;
import org.elasticsearch.common.component.LifecycleComponent;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.inject.Module;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.plugins.AbstractPlugin;
import org.elasticsearch.rest.RestModule;

import java.util.Collection;

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

    @Override
    public Collection<Class<? extends Module>> modules() {
        System.out.println("modules uc8 UC8Module...");
        return ImmutableList.<Class<? extends Module>>of(UC8Module.class);
    }

    public void onModule(RestModule module) {

        module.addRestAction(IndexAction.class);
        module.addRestAction(GetContentAction.class);
        module.addRestAction(GetContentInfoAction.class);

        module.addRestAction(Monitor.class);
    }

    @Override
    public Collection<Class<? extends LifecycleComponent>> services() {
        return ImmutableList.<Class<? extends LifecycleComponent>>of(MonitorService.class);
    }
}
