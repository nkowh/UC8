Ext.define('dm.view.monitor.Nodes', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.layout.container.VBox'
    ],
    xtype: 'layout-vertical-box',
    width: 500,
    height: 400,

    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    bodyPadding: 10,

    defaults: {
        frame: true,
        bodyPadding: 10
    },

    items: [
        {
            title: 'Panel 1',
            flex: 1,
            margin: '0 0 10 0',
            html: 'flex : 1'
        },
        {
            title: 'Panel 2',
            height: 100,
            margin: '0 0 10 0',
            html: 'height: 100'
        },
        {
            title: 'Panel 3',
            flex: 2,
            html: 'flex : 2'
        }
    ],

    initComponent: function () {
        var me = this;
        me.callParent();

        if (me.down('fieldset'))return;
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/files/_mapping',
            success: function (response) {
                var result = Ext.decode(response.responseText);
                if (result && result.dm) {
                    me.fields = [];
                    Ext.each(Ext.Object.getKeys(result.dm.mappings.files.properties), function (item) {
                        if (!Ext.String.startsWith(item, '_'))
                            me.fields.push(item)

                    });
                    me.initCondition()
                }
            }
        });
    },

});