Ext.define('dm.view.monitor.Nodes', {
    extend: 'Ext.tab.Panel',
    plain: true,
    layout: {
        type: 'table',
        columns: 3,
        tableAttrs: {
            style: {
                width: '100%'
            }
        }
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            listeners: {
                afterrender: function () {
                    me.mask('loading');
                    var service = Ext.util.Cookies.get('service');
                    Ext.Ajax.request({
                        method: 'GET',
                        url: service.replace('/dm', '') + '/_nodes',
                        callback: function (options, success, response) {
                            me.unmask();
                            var result = Ext.decode(response.responseText);
                            Ext.Object.each(result.nodes, function (key, node) {
                                me.add(Ext.create('dm.view.monitor.Node', {
                                    title: node.name, node: node,
                                    glyph: 0xf1fe
                                }));
                            });
                            me.setActiveTab(0)


                        }
                    });

                }
            }
        });

        me.callParent();
    }
});