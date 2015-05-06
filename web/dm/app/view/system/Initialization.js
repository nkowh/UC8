Ext.define('dm.view.system.Initialization', {
    extend: 'Ext.panel.Panel',

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    xtype: 'button',
                    scale: 'large',
                    iconAlign: 'top',
                    text: '清空文档',
                    glyph: 0xf1c0,
                    handler: me.clearFiles
                },
                {
                    xtype: 'button',
                    scale: 'large',
                    iconAlign: 'top',
                    text: '文档结构初始化',
                    glyph: 0xf1c0,
                    handler: me.initFiles
                }
            ]

        });

        me.callParent();
    },

    clearFiles: function () {
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/files', method: 'DELETE',
            callback: function (opts, success, response) {
                Ext.toast({
                    html: response.responseText,
                    closable: false,
                    align: 't',
                    slideInDuration: 1000,
                    minWidth: 400
                });
            }
        });
    },

    initFiles: function () {
        var q = {
            files: {
                properties: {
                    _acl: {
                        type: "nested"
                    },
                    _contents: {
                        type: "nested"
                    },
                    _createBy: {
                        type: "string"
                    },
                    _createAt: {
                        "type" : "date"
                    },
                    _lastModifyBy: {
                        type: "string"
                    },
                    _lastModifyAt: {
                        "type" : "date"
                    }
                }
            }
        }
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/files/_mapping', method: 'PUT', jsonData: q,
            callback: function (opts, success, response) {
                Ext.toast({
                    html: response.responseText,
                    closable: false,
                    align: 't',
                    slideInDuration: 400,
                    minWidth: 400
                });
            }
        });
    }


});