Ext.define('dm.view.system.NewUserForm', {
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
        title: 'User Info',
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
            {allowBlank: false, fieldLabel: 'User ID', name: '_id', emptyText: 'user id'},
            {allowBlank: false, fieldLabel: 'Password', name: 'password', emptyText: 'password', inputType: 'password'},
            {allowBlank: false, fieldLabel: 'Verify', name: 'pass', emptyText: 'password', inputType: 'password'},
            {
                xtype: 'datefield',
                fieldLabel: '创建日期',
                name: 'createAt',
                allowBlank: false,
                maxValue: new Date()
            }
        ]
    }],

    buttons: [{
        text: '注册',
        disabled: true,
        formBind: true,
        handler: function () {
            var me = this;
            var values = me.up('form').getForm().getValues(false, false, false, true);
            var user = Ext.create('dm.model.system.User', values);
            user.phantom = true;
            me.up('form').store.add(user);
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