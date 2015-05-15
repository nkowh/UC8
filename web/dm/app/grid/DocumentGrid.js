Ext.define('dm.grid.DocumentGrid', {
    extend: 'Ext.grid.Panel',
    selModel: 'rowmodel',
    width: '100%',
    requires: ['dm.model.system.User'],

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            //listeners: {
            //afterrender: function () {
            //    me.mask('loading');
            //    dm.model.system.User.load(Ext.util.Cookies.get('username'), {
            //        callback: function (user, operation, success) {
            //            me.unmask && me.unmask()
            //            if (!success)return;
            //            me.user = user;
            //
            //        }
            //    });
            //}
            //}

        });
        me.callParent();

    },

    search: function (q) {
        var me = this;
        //me.mask && me.mask('loading');
        //me.query = Ext.isObject(q) ? q : me.query;
        Ext.Ajax.request({
            method: 'POST',
            url: me.url ? me.url : Ext.util.Cookies.get('service') + '/files/_search',
            jsonData: Ext.isObject(q) ? q : me.query,
            success: function (response, opts) {
                //me.unmask && me.unmask()
                var obj = Ext.decode(response.responseText);
                var data = [];
                var fields = [];
                var root = Ext.isFunction(me.filter) ? me.filter(obj) : obj.hits.hits;

                Ext.each(root, function (item) {
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

                columns.push({
                    xtype: 'widgetcolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    dataIndex: '_favorite',
                    widget: {
                        xtype: 'sliderwidget',
                        minValue: 0,
                        maxValue: 5,
                        decimalPrecision: 0,
                        listeners: {
                            change: function (slider, value) {
                                if (!slider.getWidgetRecord) return;
                                var rec = slider.getWidgetRecord();
                                if (!rec)return;
                                var id = rec.get('_id');
                                var favorite = Ext.isArray(me.user.get('favorite')) ? Ext.Array.clone(me.user.get('favorite')) : [];
                                var favoriteItem = Ext.Array.findBy(favorite, function (item) {
                                    return item.id === id;
                                });
                                if (value === 0) {
                                    Ext.Array.remove(favorite, favoriteItem)
                                }
                                else {
                                    if (favoriteItem)favoriteItem.score = value;
                                    else favorite.push({id: id, score: value});
                                }

                                me.user.set('favorite', favorite);
                                me.user.save();
                            }
                        }
                    }
                });
                me.reconfigure(store, columns);

            },
            failure: function (response, opts) {
                //me.unmask && me.unmask()
                console.log('server-side failure with status code ' + response.status);
            }
        });
    }

});