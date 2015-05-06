Ext.define('dm.view.system.NewAclForm', {
    extend: 'Ext.form.Panel',
    frame: true,
    bodyPadding: 10,
    scrollable: true,
    width: 655,

    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 115,
        msgTarget: 'side'
    },


    buttons: [{
        text: '创建',
        disabled: true,
        formBind: true,
        handler: function () {
            var me = this.up('form');

            var acl = [];
            me.items.each(function (container) {
                if (container.xtype !== 'container')return;
                var type = container.items.getAt(0).getValue();
                var principles = container.items.getAt(1).getValueRecords();
                var permissions = container.items.getAt(2).getValueRecords();
                ace = {};
                ace[Ext.util.Format.lowercase(type)] = Ext.Array.map(principles, function (rec) {
                    return rec.get('_id')
                });
                ace.permissions = Ext.Array.map(permissions, function (rec) {
                    return rec.raw[0];
                });
                acl.push(ace);
            });

            var values = {_id: me.down('textfield[name=aclId]').getValue(), acl: acl, _createAt: new Date().getTime()}
            var aclModel = Ext.create('dm.model.system.Acl', values);
            aclModel.phantom = true;
            me.store.add(aclModel);
            me.up('window').close();
        }
    }, {
        text: '关闭',
        handler: function () {
            var me = this;
            me.up('window').close();
        }
    }],

    initComponent: function () {
        var me = this;

        me.templateAce = {
            xtype: 'container',
            layout: 'hbox',
            text: 'User Acl',
            items: [
                {
                    xtype: 'combo',
                    store: ['Users', 'Groups'],
                    width: 100,
                    allowBlank: false,
                    forceSelection: true,
                    listeners: {
                        change: function (combo, newValue, oldValue, eOpts) {
                            var principleCombo = combo.nextSibling();
                            principleCombo.bindStore(Ext.create('dm.store.system.' + newValue));
                        }
                    }
                },
                {
                    xtype: 'tagfield',
                    allowBlank: false,
                    grow: false,
                    forceSelection: true,
                    displayField: '_id',
                    valueField: '_id',
                    name: 'principle'
                },
                {
                    xtype: 'tagfield',
                    allowBlank: false,
                    grow: false,
                    forceSelection: true,
                    displayField: '_id',
                    valueField: '_id',
                    name: 'permission',
                    store: ['read', 'write']
                },
                {
                    xtype: 'button',
                    text: '-',
                    handler: me.removeCondition
                }, {
                    xtype: 'button',
                    text: '+',
                    handler: me.addCondition
                }
            ]
        }

        Ext.apply(me, {
            items: [me.templateAce]
        });

        me.callParent();

        me.insert(0, {
            xtype: 'textfield',
            name: 'aclId',
            fieldLabel: 'Acl Id',
            allowBlank: false
        });
    },

    addCondition: function () {
        var me = this.up('form');
        me.add(me.templateAce);
    },

    removeCondition: function () {
        var me = this.up('form');
        if (me.items.length === 1)return;
        me.remove(this.up('container'));
    }


});