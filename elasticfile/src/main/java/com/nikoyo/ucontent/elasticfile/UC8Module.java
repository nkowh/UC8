package com.nikoyo.ucontent.elasticfile;


import org.elasticsearch.common.inject.AbstractModule;

public class UC8Module extends AbstractModule {
    @Override
    protected void configure() {
        System.out.println("loading uc8 UC8Module...");
        bind(MonitorService.class).asEagerSingleton();

    }


}
