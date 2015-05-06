Ext.define('dm.view.document.AdvResult', {
    extend: 'Ext.grid.Panel',
    selModel: 'rowmodel',
    width:'100%',

    initComponent: function () {

        Ext.apply(this, {
            columns: [
                {text: 'id', dataIndex: '_id', flex: 1},
                {
                    text: 'highlight', dataIndex: 'highlight', flex: 1
                }, {
                    xtype: 'actioncolumn',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    items: [
                        {
                            icon: '../ext/images/icons/delete.gif',
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
                }
            ]
        });
        this.callParent();
    },

    refresh: function (grid, tool, event) {
        var me = grid;
        me.getStore().reload();
    }


});