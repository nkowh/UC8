Ext.define('dm.view.document.MyFavorite', {
    extend: 'dm.grid.DocumentGrid',

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            url: Ext.util.Cookies.get('service') + '/files/_mget',
            filter: function (obj) {
                return Ext.Array.filter(obj.docs, function (item) {
                    return item.found === true;
                });
            },
            listeners: {
                beforerender: function () {
                    //me.mask('loading');
                    dm.model.system.User.load(Ext.util.Cookies.get('username'), {
                        callback: function (user, operation, success) {
                            //me.unmask();
                            if (!success)return;
                            me.user = user;
                            var ids = Ext.isArray(me.user.get('favorite')) ? me.user.get('favorite') : [];
                            me.query = {
                                ids: ids
                            };
                            if (ids.length > 0) me.search();
                        }
                    });
                }
            }

        });
        me.callParent();
    }

    //search: function (query) {
    //    var me = this;
    //    var ids = Ext.Array.map(Ext.Array.sort(me.user.get('favorite'), function (a, b) {
    //        if (a > b)return -1; else return 1;
    //    }), function (item) {
    //        return item.id
    //    });
    //    var q = {
    //        ids: ids
    //    };
    //    Ext.Ajax.request({
    //        method: 'POST',
    //        url: Ext.util.Cookies.get('service') + '/files/_mget',
    //        jsonData: q,
    //        success: function (response, opts) {
    //            var obj = Ext.decode(response.responseText);
    //
    //            var data = [];
    //            var fields = [];
    //            Ext.each(obj.docs, function (item) {
    //                if (!item.found)return;
    //                var dest = {}
    //                Ext.apply(dest, item, item._source);
    //                delete dest._source;
    //                data.push(dest);
    //                fields = Ext.Array.merge(fields, Ext.Object.getKeys(dest));
    //
    //            });
    //
    //            var store = Ext.create('Ext.data.Store', {
    //                fields: Ext.Array.unique(fields),
    //                data: data
    //            });
    //
    //            var columns = [];
    //            Ext.each(Ext.Array.sort(Ext.Array.unique(fields)), function (field) {
    //                if (Ext.Array.contains(['_contents', '_id', '_type', '_index', '_acl', '_score', 'found'], field))return;
    //                columns.push({
    //                    flex: 1,
    //                    text: field,
    //                    dataIndex: field
    //                })
    //            });
    //            columns.push({
    //                xtype: 'widgetcolumn',
    //                sortable: false,
    //                menuDisabled: true,
    //                widget: {
    //                    xtype: 'button',
    //                    scale: 'medium',
    //                    glyph: 0xf06e,
    //                    handler: function () {
    //                        if (!this.getWidgetRecord) return;
    //                        Ext.create('Ext.window.Window', {
    //                            autoShow: true,
    //                            layout: 'fit',
    //                            maximized: true,
    //                            resizable: false,
    //                            items: [Ext.create('dm.view.document.ImageExplorer', {_id: this.getWidgetRecord().get('_id')})
    //                            ]
    //                        });
    //                    }
    //                }
    //            });
    //            me.reconfigure(store, columns);
    //
    //
    //        },
    //        failure: function (response, opts) {
    //            console.log('server-side failure with status code ' + response.status);
    //        }
    //    });
    //
    //
    //}


});