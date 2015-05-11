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
            value: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/dm',
            emptyText: 'http://192.168.1.90:9200/dm'
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
                var form = me.up('form');
                var values = me.up('form').getForm().getValues();
                Ext.Ajax.request({
                    url: values.service + '/users/' + values.username,
                    callback: function (options, success, response) {
                        if (!success) {
                            form.toast(response.responseText);
                            return;
                        }
                        var result = Ext.decode(response.responseText);
                        if (!result.found || result._source.password !== values.password) {
                            form.toast('用户名或密码不正确');
                            return;
                        }
                        var mask = Ext.create('Ext.LoadMask', {
                            msg: '进入...',
                            target: me.up('viewport')
                        });
                        mask.show();
                        Ext.util.Cookies.set("service", values.service);
                        Ext.util.Cookies.set("username", values.username);
                        window.location.reload();
                    }
                });

            }
        }
    ],

    initComponent: function () {


        this.defaults = {
            anchor: '100%',
            labelWidth: 120
        };

        this.callParent();
    },

    toast: function (html) {
        Ext.toast({
            html: html,
            closable: false,
            align: 't',
            slideInDuration: 400,
            minWidth: 400
        });
    }

});