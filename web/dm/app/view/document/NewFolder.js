Ext.define('dm.view.document.NewFolder', {
    extend: 'Ext.form.Panel',
    frame: true,
    bodyPadding: 10,
    width: 355,

    defaults: {
        anchor: '100%',
        allowBlank: false,
        msgTarget: 'side',
        labelWidth: 50
    },

    items: [
        {
            xtype: 'textfield',
            name: 'folderName'
        }
    ],

    buttons: [{
        text: 'Save',
        handler: function () {
            var me = this.up('form');
            var form = me.getForm();
            var values = form.getValues();
            if (!form.isValid())return;
            //var newFolderData = {
            //    name: values.folderName,
            //    _lastModifyAt: Ext.Date.format(new Date(), 'Y-m-d\\TH:i:s'),
            //    children: []
            //};
            var newFolderValue = {};
            newFolderValue[values.folderName] = {
                _lastModifyAt: Ext.Date.format(new Date(), 'Y-m-d\\TH:i:s'),
                _files: []
            };
            var upsetObj = {};
            upsetObj[me.parent] = newFolderValue;
            Ext.Ajax.request({
                method: 'POST',
                url: Ext.util.Cookies.get('service') + '/folders/' + Ext.util.Cookies.get('username') + '/_update',
                jsonData: {
                    "script": "ctx._source." + me.parent + " += newFolder",
                    "params": {"newFolder": newFolderValue},
                    "upsert": upsetObj
                },
                callback: function (options, success, response) {
                    if (!success) return;
                    var result = Ext.decode(response.responseText);
                    me.up('window').close();
                }
            })
            ;
        }
    },
        {
            text: 'Close',
            handler: function () {
                this.up('window').close();
            }
        }
    ],


    initComponent: function () {
        this.callParent();

    }

})
;