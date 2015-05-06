Ext.define('dm.view.system.NewSchemaForm', {
    extend: 'Ext.grid.Panel',
    frame: true,
    bodyPadding: 10,
    width: 800,
    height: 400,
    store: Ext.create('Ext.data.Store', {
        fields: ['title', 'description', {name: 'required', type: 'bool'}, 'pattern']
    }),
    plugins: {
        ptype: 'cellediting',
        clicksToEdit: 1
    },

    initComponent: function () {

        Ext.apply(this, {
            columns: [
                {
                    text: 'title', dataIndex: 'title', flex: 1, editor: {
                    xtype: 'textfield',
                    allowBlank: false
                }
                },
                {
                    text: 'description', dataIndex: 'description', flex: 1,
                    editor: {
                        xtype: 'textfield',
                        allowBlank: false
                    }
                },
                {
                    text: 'type', dataIndex: 'type', flex: 1,
                    editor: {
                        xtype: 'combo',
                        anchor: '100%',
                        forceSelection: true,
                        store: ['int', 'float', 'string', 'date', 'bool']
                    }
                },
                {
                    text: 'pattern', dataIndex: 'pattern', flex: 1, editor: {
                    xtype: 'textfield',
                    allowBlank: false
                }
                },
                {
                    text: 'required', xtype: 'checkcolumn', dataIndex: 'required', flex: 1
                },
                {
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
            tbar: [
                {
                    xtype: 'textfield',
                    name: 'title',
                    fieldLabel: 'title',
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    name: 'description',
                    fieldLabel: 'description',
                    allowBlank: false
                },
                {
                    xtype: 'button',
                    text: '+',
                    handler: this.addProperty
                }
            ],
            bbar: [
                {xtype: 'button', text: 'Save', handler: this.save},
                {
                    xtype: 'button', text: 'Close', handler: function () {
                    var me = this.up('window');
                    me.close();
                }
                }
            ]
        });
        this.callParent();
    },

    addProperty: function () {
        var me = this.up('grid');
        me.getStore().add({title: '', description: '', type: 'string', pattern: '', required: true})
    },

    onRemoveClick: function (grid, rowIndex) {
        var me = grid;
        me.getStore().removeAt(rowIndex);
    },

    save: function () {
        var me = this.up('grid');
        var description = me.down('textfield[name=description]').value;
        var title = me.down('textfield[name=title]').value
        var properties = [];
        for (var i = 0; i < me.getStore().getCount(); i++) {
            var property = me.getStore().getAt(i);
            var data = property.getData();
            delete data.id;
            properties.push(data);
        }

        var schema = Ext.create('dm.model.system.Schema', {
            _id: title,
            description: description,
            properties: properties
        });
        schema.phantom = true;
        me.parentStore.add(schema);
        me.up('window').close();
    }

});