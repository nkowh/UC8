Ext.define('dm.view.monitor.Node', {
    extend: 'Ext.Panel',

    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    scrollable: true,
    initComponent: function () {
        var me = this;
        Ext.apply(me, {

            items: [

                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [{
                        xtype: 'box',
                        html: '<span style="padding:10px" class="fa fa-laptop fa-lg"> cpu : ' + me.node.os.cpu.model + ' (' + me.node.os.cpu.total_cores + 'cores) </span>'
                    }, {
                        xtype: 'box',
                        html: '<span style="padding:10px" class="fa fa-cubes fa-lg"> memory : ' + Ext.Number.toFixed(me.node.os.mem.total_in_bytes / 1024.0 / 1024, 2) + 'M</span>'
                    }, {
                        xtype: 'box',
                        html: '<span style="padding:10px" class="fa fa-cube fa-lg"> jvm : ' + Ext.Number.toFixed(me.node.jvm.mem.heap_max_in_bytes / 1024.0 / 1024, 2) + 'M</span>'
                    }, {
                        xtype: 'checkbox',
                        boxLabel: '自动刷新',
                        checked: true,
                        handler: function (box, checked) {
                            if (checked) {
                                Ext.TaskManager.start(me.task);
                            } else {
                                Ext.TaskManager.stop(me.task);
                            }

                        }
                    }
                    ]
                },
                Ext.create('dm.view.monitor.CpuMem', {
                    itemId: 'cpu'
                }),
                Ext.create('dm.view.monitor.Disk', {
                    itemId: 'disk'
                })
            ],
            listeners: {
                destroy: function () {
                    if (me.task)Ext.TaskManager.stop(me.task);
                }
            }
        });

        me.callParent();

        me.task = Ext.TaskManager.start({
            scope: me,
            run: me.updateData,
            interval: 3000
        });
    },

    updateData: function () {
        var me = this;
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/monitor/_search/',
            jsonData: {
                size: 20,
                "sort": [
                    {"timestamp": {"order": "desc"}}
                ],
                query: {
                    term: {node: me.title.toLowerCase()}
                }

            },
            callback: function (options, success, response) {
                if (!success) {
                    form.toast(response.responseText);
                    return;
                }

                var result = Ext.decode(response.responseText);
                var cpuData = [];
                var deskData = [];
                var disk_read_size_in_bytes = 0, disk_write_size_in_bytes = 0;
                Ext.each(result.hits.hits, function (item) {
                    cpuData.push({
                        cpu_usage: item._source.os.cpu.usage,
                        mem_usage: item._source.os.mem.used_percent,
                        heap_usage: item._source.jvm.mem.heap_used_percent,
                        timestamp: item._source.timestamp
                    });
                    deskData.push({
                        disk_read: item._source.fs.total.disk_read_size_in_bytes,
                        disk_write: item._source.fs.total.disk_write_size_in_bytes,
                        timestamp: item._source.timestamp
                    });
                    disk_read_size_in_bytes = item._source.fs.total.disk_read_size_in_bytes;
                    disk_write_size_in_bytes = item._source.fs.total.disk_write_size_in_bytes;
                });
                me.getComponent('disk').refresh(deskData.reverse());
                me.getComponent('cpu').refresh(cpuData.reverse());

            }
        });
    }
});