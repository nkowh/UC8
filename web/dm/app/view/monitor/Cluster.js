Ext.define('dm.view.monitor.Cluster', {
    extend: 'Ext.grid.Panel',
    //title: { xtype:'title',text: '集群信息',textAlign:'center'},
    titleAlign: 'center',
    selModel: 'rowmodel',
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            tools: [
                {
                    type: 'refresh',
                    scrope: me,
                    callback: this.refresh
                }
            ],
            tbar: [
                {
                    fieldLabel: '副本数量',
                    name: 'number_of_replicas',
                    xtype: 'combo',
                    store: [0, 1, 2, 3]
                },
                {
                    xtype: 'button',
                    text: '应用',
                    handler: me.applySetting
                }
            ],
            listeners: {
                //rowdblclick: me.rowdblclick
            }
        });
        me.callParent();
        me.initSettings();
        me.refresh();


    },

    initSettings: function () {
        var me = this;
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/_settings',
            callback: function (options, success, response) {
                if (!success)return;
                var result = Ext.decode(response.responseText);
                me.down('combo[name=number_of_replicas]').setValue(result.dm.settings.index.number_of_replicas);
            }
        });
    },

    applySetting: function () {
        var me = this.up('grid');
        var number_of_replicas = me.down('combo[name=number_of_replicas]').value;
        //var number_of_shards = me.down('combo[name=number_of_shards]').value;

        Ext.Ajax.request({
            method: 'PUT',
            jsonData: {number_of_replicas: number_of_replicas},
            url: Ext.util.Cookies.get('service') + '/_settings',
            callback: function (options, success, response) {
                Ext.toast({
                    html: response.responseText,
                    closable: false,
                    align: 't',
                    slideInDuration: 400,
                    minWidth: 400
                });
            }
        });
    },


    refresh: function () {
        var me = this;
        var service = Ext.util.Cookies.get('service');

        if (me.xtype !== 'grid')me = me.up('grid');
        Ext.Ajax.request({
            url: service.replace('/dm', '') + '/_cluster/state',
            success: function (response) {
                var result = Ext.decode(response.responseText);
                var master_node = result.master_node;
                var data = [];
                var fields = ['id', 'isMaster', 'name', 'transport_address'];
                var shards = [];

                Ext.Object.each(result.nodes, function (key, value) {
                    Ext.each(result.routing_nodes.nodes[key], function (info) {
                        shards.push('shard' + info.shard);
                    });
                });
                shards = Ext.Array.unique(shards);

                Ext.Object.each(result.nodes, function (key, value) {
                    var node = {
                        id: key,
                        isMaster: key === master_node,
                        name: value.name,
                        transport_address: value.transport_address
                    };
                    Ext.each(result.routing_nodes.nodes[key], function (info) {
                        node['shard' + info.shard] = info;
                    });
                    Ext.each(shards, function (num) {
                        if (!node[num])node[num] = {};
                    });
                    data.push(node);
                });

                fields = Ext.Array.union(fields, Ext.Array.sort(shards));
                var store = Ext.create('Ext.data.Store', {
                    fields: fields,
                    data: data
                });
                var columns = [];
                Ext.each(fields, function (field) {
                    if (field === 'id')return;
                    if (Ext.String.startsWith(field, 'shard')) {
                        columns.push({
                            flex: 1,
                            align: 'center',
                            xtype: 'templatecolumn',
                            text: field,
                            dataIndex: field,
                            tpl: '<tpl for="' + field + '"><tpl if="state">' +
                            '<div style="width: 85px;height: 85px; border:<tpl if="primary">5<tpl else>2</tpl>px solid black;background-color: green;color: white;text-align: center;"><div>{state}</div><div>{shard}</div></div>' +
                            '</tpl></tpl>'
                        })
                    } else if (field === 'isMaster') {
                        columns.push(Ext.create('dm.grid.column.Action', {
                            align: 'center',
                            sortable: false,
                            dataIndex: field,
                            items: [{
                                style: 'font-size:40px',
                                getClass: function (v, metadata, r, rowIndex, colIndex, store) {
                                    return v ? 'fa fa-star fa-2x' : 'fa fa-circle-o fa-2x'
                                },
                                handler: me.rowdblclick
                            }]
                        }));

                    } else {
                        columns.push({
                            flex: 2,
                            align: 'center',
                            text: field,
                            dataIndex: field
                        })
                    }
                });

                me.reconfigure(store, columns);
            }
        });
    },



    rowdblclick: function (view, rowIndex, colIndex, item, e, record) {
        var me = this.up('grid');
        var service = Ext.util.Cookies.get('service');
        var nodeId = record.get('id');
        Ext.Ajax.request({
            url: service.replace('/dm', '') + '/_nodes/' + nodeId,
            callback: function (options, success, response) {
                if (!success) return;
                var result = Ext.decode(response.responseText);

                Ext.create('Ext.window.Window', {
                    title: record.get('name'),
                    autoShow: true,
                    layout: 'fit',
                    height: 500,
                    width: 600,
                    scrollable: true,
                    layout: 'fit',
                    items: [Ext.create('dm.tree.CodeTree', {
                        rootVisible: false,
                        code:  result.nodes[nodeId]
                    })]
                });
            }
        });


    }


})
;