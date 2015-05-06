Ext.define('dm.view.system.Acls', {
    extend: 'Ext.grid.Panel',
    store: Ext.create('dm.store.system.Acls'),
    selModel: 'rowmodel',

    initComponent: function () {

        Ext.apply(this, {
            columns: [
                {text: 'username', dataIndex: '_id', flex: 1},
                {
                    xtype: 'templatecolumn', text: 'principle', dataIndex: 'acl', flex: 2,
                    tpl: '<ul><tpl for="acl"><li>' +
                    '<tpl if="users"><tpl for="users">{.}  </tpl>' +
                    '<tpl elseif="groups"><tpl for="groups">{.}</tpl></tpl>' +
                    ' : <tpl for="permissions">{.}  </tpl>' +
                    '</li></tpl></ul>'
                },
                {
                    text: 'createAt', dataIndex: 'createAt',xtype:'datecolumn', format:'Y-m-d' , flex: 1
                }, {
                    xtype: 'actioncolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    items: [
                        {
                            icon: '../lib/icons/delete.png',
                            scope: this,
                            handler: this.onRemoveClick
                        }
                    ]
                }
            ],
            tools: [
                {
                    type: 'refresh',
                    callback: this.refresh
                },
                {
                    type: 'plus',
                    callback: this.createAcl
                }
            ]
        });
        this.callParent();
    },

    refresh: function (grid, tool, event) {
        var me = grid;
        me.getStore().reload();
    },

    createAcl: function (grid, tool, event) {
        var me = grid;
        var newUser = Ext.create('Ext.window.Window', {
            title: 'Acl', closable: false, modal: true, items: [
                Ext.create('dm.view.system.NewAclForm', {store: me.getStore()})
            ]
        });
        newUser.show();
    },


    onEditClick: function (grid, rowIndex) {

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