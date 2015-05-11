Ext.define('dm.view.document.MyDocument', {
    extend: 'Ext.grid.Panel',
    selModel: 'rowmodel',
    width: '100%',

    initComponent: function () {

        Ext.apply(this, {
            columns: [
                {text: 'id', dataIndex: '_id', flex: 1},
                {
                    text: 'highlight', dataIndex: 'highlight', flex: 1
                }, {
                    xtype: 'actioncolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    items: [
                        {
                            icon: '../lib/icons/delete.png',
                            scope: this,
                            handler: this.onRemoveClick
                        }
                    ]
                }
            ],
            tools: [
                {
                    type: 'refresh',
                    callback: this.refresh
                }
            ]

        });
        this.callParent();
        this.search();
    },

    refresh: function () {
        var me = this.xtype !== 'grid' ? this.up('grid') : this;
        me.getStore().reload();
    },

    search: function (query) {
        var me = this;
        var q = {
            size: 50,
            "query": {
                term: {_createBy: Ext.util.Cookies.get("username")}
            }
        };
        Ext.Ajax.request({
            method: 'POST',
            url: Ext.util.Cookies.get('service') + '/files/_search',
            jsonData: q,
            success: function (response, opts) {
                var obj = Ext.decode(response.responseText);

                var data = [];
                var fields = [];
                Ext.each(obj.hits.hits, function (item) {
                    var dest = {}
                    Ext.apply(dest, item, item._source);
                    delete dest._source;
                    data.push(dest);
                    fields = Ext.Array.merge(fields, Ext.Object.getKeys(dest));

                });

                var store = Ext.create('Ext.data.Store', {
                    fields: Ext.Array.unique(fields),
                    data: data
                });

                var columns = [];
                Ext.each(Ext.Array.sort(Ext.Array.unique(fields)), function (field) {
                    if (Ext.Array.contains(['_contents', '_id', '_type', '_index', '_acl', '_score'], field))return;
                    columns.push({
                        flex: 1,
                        text: field,
                        dataIndex: field
                    })
                });
                Ext.Array.insert(columns, 0, [Ext.create('dm.grid.column.Action', {
                        xtype: 'actioncolumn',
                        sortable: false,
                        scope: me,
                        items: [{
                            style: 'font-size:20px;color:Black;',
                            iconCls: 'fa fa-file-image-o fa-lg',
                            handler: function (grid, rowIndex) {
                                Ext.create('Ext.window.Window', {
                                    autoShow: true,
                                    layout: 'fit',
                                    maximized: true,
                                    resizable: false,
                                    items: [Ext.create('dm.view.document.ImageExplorer', {_id: grid.getStore().getAt(rowIndex).get('_id')})
                                    ]
                                });
                            }
                        }]
                    }
                )]);

                me.reconfigure(store, columns);


            },
            failure: function (response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });


    }


});