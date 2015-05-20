Ext.define('dm.view.document.Upload', {
    extend: 'Ext.form.Panel',
    frame: true,
    title: 'File Upload Form',
    bodyPadding: 10,
    scrollable: true,
    width: 355,

    defaults: {
        anchor: '100%',
        allowBlank: false,
        msgTarget: 'side',
        labelWidth: 50
    },

    items: [
        {
            xtype: 'fieldset',
            title: 'files ',
            defaultType: 'filefield',
            defaults: {
                anchor: '100%'
            }, items: [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                    xtype: 'filefield',
                    emptyText: 'Select an image',
                    fieldLabel: 'Image',
                    name: 'Image',
                    buttonText: '',
                    buttonConfig: {
                        glyph: 0xf0c6
                    },
                    listeners: {
                        afterrender: function (file, eOpts) {
                            var el = file.getEl();
                            file.fileInputEl.set({multiple: 'multiple'});
                        }
                    }
                }, {
                    xtype: 'button', text: '+', handler: function () {
                        fieldset = this.up('fieldset');
                        fieldset.add({
                            xtype: 'filefield',
                            emptyText: 'Select an image',
                            fieldLabel: 'Image',
                            name: 'Image',
                            buttonText: '',
                            buttonConfig: {
                                glyph: 0xf0c6
                            }
                        });
                    }
                }]
            },

        ]
        },
        , {
            xtype: 'hiddenfield',
            name: 'metadata'
        }, {
            xtype: 'combo',
            fieldLabel: 'ACL',
            name: 'acl',
            allowBlank: false,
            store: Ext.create('dm.store.system.Acls'),
            displayField: '_id',
            valueField: 'acl',
            forceSelection: true
        }, {
            xtype: 'combo',
            fieldLabel: 'schema',
            allowBlank: false,
            store: Ext.create('dm.store.system.Schemas'),
            displayField: '_id',
            valueField: '_id',
            forceSelection: true,
            listeners: {
                change: function (combo, newValue, oldValue, eOpts) {
                    if (newValue === null)return;
                    var me = combo.up('form');
                    var schemaModel = combo.getStore().getById(newValue);
                    var properties = schemaModel.get('properties');
                    var fieldset = combo.nextSibling('fieldset');
                    fieldset.removeAll();
                    fieldset.setTitle(schemaModel.get('_id'));
                    Ext.each(properties, function (property) {
                        if (property.type === 'string') {
                            fieldset.add({
                                xtype: 'textfield',
                                fieldLabel: property.title,
                                name: property.title,
                                value: property.title
                            })
                        } else if (property.type === 'int') {
                            fieldset.add({
                                xtype: 'numberfield',
                                allowDecimals: false,
                                fieldLabel: property.title,
                                name: property.title,
                                value: property.title
                            })
                        } else if (property.type === 'float') {
                            fieldset.add({
                                xtype: 'numberfield',
                                fieldLabel: property.title,
                                name: property.title,
                                value: property.title
                            })
                        } else if (property.type === 'bool') {
                            fieldset.add({
                                xtype: 'checkboxfield',
                                fieldLabel: property.title,
                                name: property.title,
                                value: property.title
                            })
                        } else if (property.type === 'date') {
                            fieldset.add({
                                xtype: 'datefield',
                                fieldLabel: property.title,
                                name: property.title,
                                value: property.title
                            })
                        }

                    });

                }
            }
        }, {
            xtype: 'fieldset',
            itemId: 'metadata_set',
            title: 'object ',
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            }, items: []
        }
    ],
    //errorReader: Ext.create('dm.data.reader.SubmitResultReader', {}),

    buttons: [{
        text: 'Save',
        handler: function () {
            var me = this.up('form');
            var fieldset = me.getComponent('metadata_set');
            var aclCombo = me.down('combo[name=acl]');
            var values = {};
            fieldset.items.each(function (field) {
                values[field.getName()] = field.getValue();
            });
            Ext.apply(values, {
                _acl: aclCombo.getValue(),
                _createBy: Ext.util.Cookies.get("username"),
                _createAt: Ext.Date.format(new Date(),'Y-m-d\\TH:i:s')
            });
            var metadatafield = me.down('hiddenfield[name=metadata]');
            metadatafield.setValue(Ext.encode(values));
            var form = me.getForm();
            var uuid = Ext.data.identifier.Uuid.createRandom()();
            var documentUrl = Ext.util.Cookies.get('service') + '/files/' + uuid;
            if (form.isValid()) {
                form.submit({
                    url: documentUrl,
                    waitMsg: 'uploading ...',
                    failure: function (fp, o) {
                        me.checkResult(documentUrl);
                    },
                    success: function (fp, o) {
                        me.checkResult(documentUrl);
                    }
                });
            }
        }
    }, {
        text: 'Reset',
        handler: function () {
            this.up('form').getForm().reset();
        }
    }],


    checkResult: function (url) {
        Ext.Ajax.request({
            url: url,
            success: function (response, opts) {
                Ext.toast({
                    html: 'success',
                    closable: false,
                    align: 't',
                    slideInDuration: 400,
                    minWidth: 400
                });
            },
            failure: function (response, opts) {
                Ext.toast({
                    html: 'failure',
                    closable: false,
                    align: 't',
                    slideInDuration: 400,
                    minWidth: 400
                });
            }
        });
    },

    initComponent: function () {

        this.callParent();

    }

});