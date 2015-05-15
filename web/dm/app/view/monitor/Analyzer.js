Ext.define('dm.view.monitor.Analyzer', {
    extend: 'Ext.form.Panel',
    frame: true,
    bodyPadding: 10,
    width: 355,

    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 115,
        msgTarget: 'side'
    },

    items: [{
        xtype: 'fieldset',
        title: '语句分析',
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
            {allowBlank: false, fieldLabel: '语句', name: 'text'}
        ]
    }],

    buttons: [{
        text: '分析',
        disabled: true,
        formBind: true,
        handler: function () {
            var me = this;
            var service = Ext.util.Cookies.get('service');
            Ext.Ajax.request({
                method: 'POST',
                url: service + '/_analyze?analyzer=standard',
                rawData: me.up('form').getForm().getValues().text,
                callback: function (options, success, response) {
                    if (!success) return;
                    var result = Ext.decode(response.responseText);
                    Ext.create('Ext.window.Window', {
                        title: '结果',
                        autoShow: true,
                        layout: 'fit',
                        height: 500,
                        width: 600,
                        scrollable: true,
                        layout: 'fit',
                        items: [Ext.create('dm.tree.CodeTree', {
                            rootVisible: false,
                            code: result
                        })]
                    });


                }
            });
        }
    }]


});