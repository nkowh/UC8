package com.nikoyo.ucontent.uc8;


import com.nikoyo.ucontent.uc8.ansj.index.AnsjAnalysisBinderProcessor;
import com.nikoyo.ucontent.uc8.file.*;
import com.nikoyo.ucontent.uc8.monitor.MonitorService;
import com.nikoyo.ucontent.uc8.rest.*;
import com.nikoyo.ucontent.uc8.security.SecurityService;
import org.elasticsearch.common.collect.ImmutableList;
import org.elasticsearch.common.component.LifecycleComponent;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.inject.Module;
import org.elasticsearch.index.analysis.AnalysisModule;
import org.elasticsearch.plugins.AbstractPlugin;
import org.elasticsearch.rest.RestModule;

import java.util.Collection;

public class Plugin extends AbstractPlugin {


    @Inject
    public Plugin() {
    }

    public String name() {
        return "uContent";
    }

    public String description() {
        return "uContent plugin";
    }

    public void onModule(AnalysisModule module) {
        AnalysisModule analysisModule = (AnalysisModule) module;
        analysisModule.addProcessor(new AnsjAnalysisBinderProcessor());
    }

    public void onModule(RestModule module) {
        module.addRestAction(IndexAction.class);
        module.addRestAction(GetAction.class);
        module.addRestAction(GetContentAction.class);
        module.addRestAction(GetContentInfoAction.class);
        module.addRestAction(SearchAction.class);

        module.addRestAction(DeleteAction.class);
        module.addRestAction(UpdateAction.class);

    }

    @Override
    public Collection<Class<? extends LifecycleComponent>> services() {
        return ImmutableList.<Class<? extends LifecycleComponent>>of(MonitorService.class, SecurityService.class);
    }
}
