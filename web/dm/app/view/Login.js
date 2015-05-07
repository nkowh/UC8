Ext.define('dm.view.Login', {
    extend: 'Ext.form.Panel',
    frame: true,
    width: 420,
    bodyPadding: 10,
    title: 'uContent DM',
    shadowOffset: 10,
    defaultType: 'textfield',

    items: [
        {
            allowBlank: false,
            fieldLabel: 'Service',
            name: 'service',
            value: 'http://192.168.1.138:9200/dm',
            emptyText: 'http://192.168.1.138:9200/dm'
        },
        {
            allowBlank: false,
            fieldLabel: 'User ID',
            name: 'username',
            value: 'shasha',
            emptyText: 'user id'
        }, {
            allowBlank: false,
            fieldLabel: 'Password',
            name: 'password',
            value: '123456',
            emptyText: 'password',
            inputType: 'password'
        }
    ],

    buttons: [
        {
            text: '进入',
            handler: function () {
                var me = this;
                var mask = Ext.create('Ext.LoadMask', {
                    msg: '进入...',
                    target: me.up('viewport')
                });
                mask.show();
                var service = this.up('form').down('textfield[name=service]').getValue();
                var username = this.up('form').down('textfield[name=username]').getValue();
                var password = this.up('form').down('textfield[name=password]').getValue();
                Ext.util.Cookies.set("service", service);
                Ext.util.Cookies.set("username", username);
                window.location.reload();

            }
        }
    ],

    initComponent: function () {
        this.defaults = {
            anchor: '100%',
            labelWidth: 120
        };

        this.callParent();
    }

});