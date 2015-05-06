Ext.define('dm.view.document.FullTextSearch', {
    extend: 'Ext.grid.Panel',
    title: '全文搜索',
    selModel: 'rowmodel',
    // store: Ext.create('dm.store.document.Documents'),
    requires: ['dm.model.system.User'],

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            tools: [
                {
                    type: 'refresh',
                    callback: this.refresh
                }
            ],
            tbar: [
                {
                    xtype: 'textfield',
                    name: 'text',
                    allowBlank: false
                },
                {
                    xtype: 'button',
                    text: 'search',
                    handler: this.search
                }
            ],
            listeners: {
                afterrender: function () {
                    me.mask('loading');
                    dm.model.system.User.load(Ext.util.Cookies.get('username'), {
                        callback: function (user, operation, success) {
                            me.unmask();
                            if (!success)return;
                            me.user = user;
                        }
                    });
                }
            }
        });
        me.callParent();

    },


    refresh: function (grid, tool, event) {
        var me = grid;
        me.getStore().reload();
    },

    search: function () {
        var me = this.up('grid');

        var keywords = me.down('textfield[name=text]').getValue();
        var q = {
            size: 50,
            "query": {
                "bool": {
                    "must": [
                        {match: {'_all': keywords}},
                        {
                            "nested": {
                                "path": "_acl",
                                "query": {
                                    "bool": {
                                        "must": [
                                            {"match": {"_acl.permissions": "read"}},
                                            {"match": {"_acl.users": Ext.util.Cookies.get('username')}}
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
            //"highlight": {
            //    //"pre_tags": ['<span class="text-danger">'],
            //    //"post_tags": ['</span>'],
            //    "fields": {
            //        "*": {}
            //    }
            //}
        };
        //me.getStore().load({params: q});
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
                    delete dest._source;

                    var favorite = Ext.Array.findBy(me.user.get('favorite'), function (item) {
                        return item.id === dest._id;
                    });
                    dest._favorite = favorite ? favorite.score : 0;
                    data.push(dest);
                    fields = Ext.Array.merge(fields, Ext.Object.getKeys(dest));

                });

                var store = Ext.create('Ext.data.Store', {
                    fields: Ext.Array.unique(fields),
                    data: data
                });

                var columns = [];
                Ext.each(Ext.Array.unique(fields), function (field) {
                    if (Ext.Array.contains(['_contents', '_id', '_type', '_index', '_acl'], field))return;
                    columns.push({
                        flex: 1,
                        text: field,
                        dataIndex: field
                    })
                });

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
        })
        ;


    },


    onStar: function (view, rowIndex, colIndex, item, e, record, row) {
        item.icon = '../lib/icons/star-f.png'
        this.updater();
    }


})
;