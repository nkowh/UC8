Ext.define('dm.view.document.AdvSearch', {
    extend: 'Ext.panel.Panel',
    title: '高级搜索',
    layout: 'vbox',


    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [Ext.create('dm.view.document.AdvCodition'), Ext.create('dm.view.document.AdvResult')]
        });
        me.callParent();
    },

    search: function (query) {
        var me = this.up('panel').down('grid');
        var q = {
            size: 50,
            "query": query
        };
        me.query = q;
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
                    if (Ext.Array.contains(['_contents', '_id', '_type', '_index', '_acl'], field))return;
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
                        scale: 'medium',
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