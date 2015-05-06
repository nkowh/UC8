Ext.define('dm.view.system.Schemas', {
    extend: 'Ext.grid.Panel',
    store: Ext.create('dm.store.system.Schemas'),
    selModel: 'rowmodel',
    plugins: {
        ptype: 'rowediting',
        clicksToEdit: 2
    },


    initComponent: function () {

        Ext.apply(this, {
            columns: [
                {text: 'name', dataIndex: '_id', flex: 1},
                {
                    text: 'description', dataIndex: 'description', flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                },
                {
                    xtype: 'actioncolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    items: [
                        {
                            icon: '../lib/icons/cog_edit.png',
                            scope: this,
                            handler: this.onEditClick
                        },
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
                    callback: this.createSchema
                }
            ]
        });
        this.callParent();
    },

    refresh: function (grid, tool, event) {
        var me = grid;
        me.getStore().reload();
    },

    createSchema: function (grid, tool, event) {
        var me = grid;
        var newSchema = Ext.create('Ext.window.Window', {
            title: 'Schema', closable: false, layout: 'fit', modal: true, items: [
                Ext.create('dm.view.system.NewSchemaForm', {parentStore: me.getStore()})
            ]
        });
        newSchema.show();
    },
    onEditClick: function (grid, rowIndex) {
        var me = this;
        var selectionModel = me.getStore().getAt(rowIndex);
        var newSchema = Ext.create('Ext.window.Window', {
            title: 'Schema', closable: false, layout: 'fit', modal: true, items: [
                Ext.create('dm.view.system.EditSchemaForm', {parentStore: me.getStore(), model: selectionModel})
            ]
        });
        newSchema.show();
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