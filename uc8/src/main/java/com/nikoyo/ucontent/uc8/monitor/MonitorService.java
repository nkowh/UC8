package com.nikoyo.ucontent.uc8.monitor;

import org.elasticsearch.ElasticsearchException;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.component.AbstractLifecycleComponent;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.common.xcontent.ToXContent;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.common.xcontent.json.JsonXContent;
import org.elasticsearch.monitor.fs.FsService;
import org.elasticsearch.monitor.jvm.JvmService;
import org.elasticsearch.monitor.network.NetworkService;
import org.elasticsearch.monitor.os.OsService;
import org.elasticsearch.monitor.process.ProcessService;
import org.elasticsearch.threadpool.ThreadPool;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;


public class MonitorService extends AbstractLifecycleComponent<MonitorService> {

    private final ThreadPool threadPool;

    @Inject
    private ProcessService processService;
    @Inject
    private OsService osService;
    @Inject
    private NetworkService networkService;
    @Inject
    private JvmService jvmService;
    @Inject
    private FsService fsService;
    @Inject
    private Client client;


    @Inject
    public MonitorService(Settings settings, ThreadPool threadPool) {
        super(settings);
        this.threadPool = threadPool;
    }

    @Override
    protected void doStart() throws ElasticsearchException {
        threadPool.scheduleWithFixedDelay(new Monitor(), TimeValue.timeValueSeconds(3));
    }

    @Override
    protected void doStop() throws ElasticsearchException {

    }

    @Override
    protected void doClose() throws ElasticsearchException {

    }

    class Monitor implements Runnable {

        public void run() {
            ToXContent.Params params=new ToXContent.MapParams(new HashMap<String, String>());
            try {
                XContentBuilder xContentBuilder = JsonXContent.contentBuilder();
                xContentBuilder.startObject();
                xContentBuilder.field("node", client.settings().get("node.name"));
                xContentBuilder.field("timestamp", new Date().getTime());
                //processService.stats().toXContent(xContentBuilder, null);
                osService.stats().toXContent(xContentBuilder, params);
                networkService.stats().toXContent(xContentBuilder, params);
                jvmService.stats().toXContent(xContentBuilder, params);
                fsService.stats().toXContent(xContentBuilder, params);

                xContentBuilder.endObject();
                IndexRequest indexRequest = new IndexRequest("system", "monitor", null);

                indexRequest.listenerThreaded(false);
                indexRequest.operationThreaded(true);
                indexRequest.source(xContentBuilder);
                indexRequest.timeout(IndexRequest.DEFAULT_TIMEOUT);
                indexRequest.refresh(indexRequest.refresh());
                client.index(indexRequest);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


}
