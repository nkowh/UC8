Ext.define('dm.view.system.NewGroupForm', {
    extend: 'Ext.form.Panel',
    frame: true,
    bodyPadding: 10,
    scrollable: true,
    width: 355,

    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 115,
        msgTarget: 'side'
    },

    items: [{
        xtype: 'fieldset',
        title: 'Group Info',
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
            {allowBlank: false, fieldLabel: 'Group ID', name: '_id', emptyText: 'group id'},
            {allowBlank: false, fieldLabel: 'Display', name: 'display', emptyText: 'display'},
            {
                xtype: 'datefield',
                format: 'Y/m/d',
                fieldLabel: '创建日期',
                name: 'createAt',
                allowBlank: false,
                maxValue: new Date()
            }
        ]
    }],

    buttons: [{
        text: '创建',
        disabled: true,
        formBind: true,
        handler: function () {
            var me = this;
            var datefield = me.up('form').down('datefield');
            var values = me.up('form').getForm().getValues(false, false, false, true);
            var group = Ext.create('dm.model.system.Group', values);
            group.phantom = true;
            me.up('form').store.add(group);
            me.up('window').close();
        }
    }, {
        text: '关闭',
        handler: function () {
            var me = this;
            me.up('window').close();
        }
    }]


});