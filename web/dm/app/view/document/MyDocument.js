Ext.define('dm.view.document.MyDocument', {
    extend: 'Ext.grid.Panel',
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            tbar: [
                {
                    xtype: 'container', items: [
                    {
                        xtype: 'breadcrumb',
                        showIcons: true,
                        listeners: {
                            selectionchange: me.onSelectionchange
                        }
                    },
                    {xtype: 'button', glyph: 0xf093, handler: me.newFile, text: '上传文件'},
                    {xtype: 'button', glyph: 0xf114, handler: me.newFolder, text: '新建文件夹'}

                ]
                }
            ],
            listeners: {
                itemclick: me.onItemClick
            }
        });
        me.callParent();
        me.loadFolder();
    },

    loadFolder: function (path) {
        var me = this;
        me.isloading = true;
        Ext.Ajax.request({
            method: 'GET',
            url: Ext.util.Cookies.get('service') + '/folders/' + Ext.util.Cookies.get('username'),
            callback: function (options, success, response) {
                if (!success) return;
                var userFolder = Ext.decode(response.responseText);
                var fields = [{name: 'isFolder', type: 'bool'}, 'text', 'path', {name: '_lastModifyAt', type: 'date'}];

                var data = {text: 'root', path: 'root'};
                me.buildFolderTree(data, userFolder._source.root);
                var breadcrumbStore = Ext.create('Ext.data.TreeStore', {
                    fields: fields,
                    root: data
                });
                var breadcrumb = me.down('breadcrumb');
                breadcrumb.setStore(breadcrumbStore);
                if (path) {
                    breadcrumb.setSelection(breadcrumbStore.findNode('path', path));
                } else {
                    breadcrumb.setSelection('root');
                }


                me.reconfigure(Ext.create('Ext.data.Store', {
                    fields: fields,
                    data: breadcrumb.getSelection().childNodes
                }), [{
                    text: '',
                    dataIndex: 'isFolder'
                }, {
                    text: '文件名',
                    xtype: 'templatecolumn',
                    flex: 1,
                    dataIndex: 'text',
                    tpl: '<a href="javascript:void(0);">{text}</a>'
                }, {
                    text: '修改时间',
                    flex: 1,
                    xtype: 'datecolumn',
                    format: 'Y-m-d H:i:s',
                    dataIndex: '_lastModifyAt'
                }]);
                me.isloading = false;
            }
        });

    },

    loadFiles: function (folderId) {
        Ext.Ajax.request({
            method: 'GET',
            url: Ext.util.Cookies.get('service') + '/folderfile/' + folderId,
            callback: function (options, success, response) {
                if (!success) return;
                var userFolder = Ext.decode(response.responseText);


                var fields = [{name: 'isFolder', type: 'bool'}, 'text', 'path', {name: '_lastModifyAt', type: 'date'}];

                var data = {text: 'root', path: 'root'};
                me.buildFolderTree(data, userFolder._source.root);
                var breadcrumbStore = Ext.create('Ext.data.TreeStore', {
                    fields: fields,
                    root: data
                });
                var breadcrumb = me.down('breadcrumb');
                breadcrumb.setStore(breadcrumbStore);
                if (path) {
                    breadcrumb.setSelection(breadcrumbStore.findNode('path', path));
                } else {
                    breadcrumb.setSelection('root');
                }

                me.isloading = false;
            }
        });
    },

    onSelectionchange: function (view, node, eOpts) {
        var me = this.up('grid');
        if (!node || me.isloading)return;
        me.loadFolder(node.get('path'));
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
    },

    newFile: function () {


    },

    newFolder: function () {
        var me = this.up('grid');
        var breadcrumb = me.down('breadcrumb');
        var parent = breadcrumb.getSelection() ? breadcrumb.getSelection().get('path') : 'root';
        Ext.create('Ext.window.Window', {
            autoShow: true,
            title: '新建文件夹', closable: false, modal: true, items: [
                Ext.create('dm.view.document.NewFolder', {parent: parent})
            ]
        });
    },

    onItemClick: function (view, record, item, index, e, eOpts) {
        var me = this;
        if (!record.get('isFolder'))return;
        var breadcrumb = me.down('breadcrumb');
        me.loadFolder(record.get('path'));

    }

});