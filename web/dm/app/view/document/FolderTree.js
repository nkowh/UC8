Ext.define('dm.view.document.FolderTree', {
    extend: 'Ext.tree.Panel',
    width: 500,
    height: 500,
    listeners: {
        afterrender: function () {
            var me = this;
            me.mask('loading');
            var service = Ext.util.Cookies.get('service');
            Ext.Ajax.request({
                method: 'GET',
                url: Ext.util.Cookies.get('service') + '/folders/' + Ext.util.Cookies.get('username'),
                callback: function (options, success, response) {
                    me.unmask();
                    var userFolder = Ext.decode(response.responseText);
                    var root = {text: 'root', path: 'root'};
                    me.buildFolderTree(root, userFolder._source.root);
                    me.setRootNode(root);
                    me.selectPath('root');
                }
            });


        },
        selectionchange: function (tree, selected, eOpts) {

        }
    },

    bbar: [
        {
            xtype: 'button',
            text: 'OK',
            handler: function () {
                var me = this.up('treepanel');
                var selection = me.getSelection()[0];
                upsetObj = {};
                upsetObj[selection.get('path') + '._files'] = [me.fileId];
                Ext.Ajax.request({
                    method: 'POST',
                    url: Ext.util.Cookies.get('service') + '/folders/' + Ext.util.Cookies.get('username') + '/_update',
                    jsonData: {
                        "script": "ctx._source." + selection.get('path') + "._files += newFile",
                        "params": {"newFile": me.fileId},
                        upsert: upsetObj
                    },
                    callback: function (options, success, response) {
                        me.unmask();
                        me.up('window').close();
                    }
                });
            }
        }
    ],

    initComponent: function () {
        var me = this;
        this.callParent();
    },

    buildFolderTree: function (parent, obj) {
        var me = this;
        parent.children = [];
        Ext.each(Ext.Object.getAllKeys(obj), function (key) {
            if (Ext.Array.contains(['_files', '_lastModifyAt'], key))return;
            var child = {
                isFolder: true,
                text: key,
                path: parent.path + '.' + key,
                _lastModifyAt: obj[key]._lastModifyAt
            };
            parent.children.push(child);
            me.buildFolderTree(child, obj[key]);
        });
    }


});