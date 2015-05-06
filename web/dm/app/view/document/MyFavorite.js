Ext.define('dm.view.document.MyFavorite', {
    extend: 'Ext.grid.Panel',
    selModel: 'rowmodel',
    width: '100%',
    requires: ['dm.model.system.User'],

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
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
            ], listeners: {
                afterrender: function () {
                    me.mask('loading');
                    dm.model.system.User.load(Ext.util.Cookies.get('username'), {
                        callback: function (user, operation, success) {
                            me.unmask();
                            if (!success)return;
                            me.user = user;
                            me.search();
                        }
                    });
                }
            }

        });
        me.callParent();
    },

    refresh: function () {
        var me = this.xtype !== 'grid' ? this.up('grid') : this;
        me.getStore().reload();
    },

    search: function (query) {
        var me = this;
        var ids = Ext.Array.map(Ext.Array.sort(me.user.get('favorite'), function (a, b) {
            if (a > b)return -1; else return 1;
        }), function (item) {
            return item.id
        });
        var q = {
            ids: ids
        };
        Ext.Ajax.request({
            method: 'POST',
            url: Ext.util.Cookies.get('service') + '/files/_mget',
            jsonData: q,
            success: function (response, opts) {
                var obj = Ext.decode(response.responseText);

                var data = [];
                var fields = [];
                Ext.each(obj.docs, function (item) {
                    if (!item.found)return;
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
                    if (Ext.Array.contains(['_contents', '_id', '_type', '_index','_acl','_score','found'], field))return;
                    columns.push({
                        flex: 1,
                        text: field,
                        dataIndex: field
                    })
                });
                columns.push({
                    xtype: 'widgetcolumn',
                    sortable: false,
                    menuDisabled: true,
                    widget: {
                        xtype: 'button',
                        scale:'medium',
                        glyph: 0xf06e,
                        handler: function () {
                            if (!this.getWidgetRecord) return;
                            Ext.create('Ext.window.Window', {
                                autoShow: true,
                                layout: 'fit',
                                maximized: true,
                                resizable: false,
                                items: [Ext.create('dm.view.document.ImageExplorer', {_id: this.getWidgetRecord().get('_id')})
                                ]
                            });
                        }
                    }
                });
                me.reconfigure(store, columns);


            },
            failure: function (response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });


    }


});