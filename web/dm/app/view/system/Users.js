Ext.define('dm.view.system.Users', {
    extend: 'Ext.grid.Panel',
    store: Ext.create('dm.store.system.Users'),
    selModel: 'rowmodel',
    plugins: {
        ptype: 'rowediting',
        clicksToEdit: 2
    },


    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            columns: [
                {text: 'username', dataIndex: '_id', flex: 1},
                {
                    text: 'password', dataIndex: 'password', flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                },
                {
                    text: 'createAt', dataIndex: 'createAt', flex: 1,
                    editor: {
                        xtype: 'datefield',
                        anchor: '100%'
                    }
                },
                Ext.create('dm.grid.column.Action',{
                    sortable: false,
                    scope: me,
                    items: [{
                        style:'font-size:20px;color:DarkRed;',
                        iconCls:'fa fa-remove',
                        handler: me.onRemoveClick
                    }]
                })
            ],
            tools: [
                {
                    type: 'refresh',
                    callback: me.refresh
                },
                {
                    type: 'plus',
                    callback: me.createUser
                }
            ]
        });
        this.callParent();
    },

    refresh: function (grid, tool, event) {
        var me = grid;
        me.getStore().reload();
    },

    createUser: function (grid, tool, event) {
        var me = grid;
        var newUser = Ext.create('Ext.window.Window', {
            title: '用户', closable: false, modal: true, items: [
                Ext.create('dm.view.system.NewUserForm', {store: me.getStore()})
            ]
        });
        newUser.show();
    },

    onRemoveClick: function (grid, rowIndex) {
        var me = this;
        var selectionModel = me.getStore().getAt(rowIndex);
        me.setSelection(selectionModel);
        Ext.Msg.show({
            title: '确认删除',
            msg: '确认删除' + selectionModel.get('_id') + "?",
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            fn: function (buttonId) {
                if (buttonId === 'yes') {
                    me.getStore().removeAt(rowIndex);
                }
            }
        });
    }


});