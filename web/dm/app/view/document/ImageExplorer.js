Ext.define('dm.view.document.ImageExplorer', {
    extend: 'Ext.panel.Panel',
    xtype: 'imageexplorer',
    layout: 'border',

    defaults: {
        collapsible: false,
        split: false
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                xtype: 'dataview',
                region: 'west',
                margin: '5 0 0 0',
                width: 210,
                minWidth: 100,
                maxWidth: 250,
                scrollable: 'vertical',
                itemSelector: 'li',
                style: {
                    'background-color': '#ffffff'
                },
                itemId: 'thumbnails',
                tpl: [
                    '<ol>',
                    '<tpl for=".">',
                    '<li>',
                    '<img style="width:150px" src="' + Ext.util.Cookies.get('service') + '/files/' + me._id + '/_content/{itemId}" />',
                    '</li>',
                    '</tpl>',
                    '</ol>'
                ],
                listeners: {
                    selectionchange: me.onSelectionChanged,
                    refresh: me.onThumbnialsRefresh
                }
            }, {
                region: 'center',
                layout: 'center',
                scrollable: true,
                itemId: 'big',
                tbar: [
                    {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf010,
                        handler: me.zoomout
                    },
                    {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf00e,
                        handler: me.zoomin
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf0e2,
                        handler: me.rotateleft
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf01e,
                        handler: me.rotateright
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf07d,
                        handler: me.fitheight
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf07e,
                        handler: me.fitwidth
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf05e,
                        handler: me.restore
                    },


                    {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf049,
                        handler: me.first
                    },
                    {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf04a,
                        handler: me.backward
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf04e,
                        handler: me.forward
                    }, {
                        xypte: 'button',
                        scale: 'large',
                        glyph: 0xf050,
                        handler: me.last
                    },
                ],
                items: [
                    {
                        xtype: 'image',
                        scrollable: true,
                        split: true,
                        resizable: false
                    }
                ]
            }, {
                region: 'east',
                width: 300,
                title: 'Properties',
                frame: true,
                xtype: 'propertygrid',
                bbar: [
                    {
                        xtype: 'button',
                        text: '保存',
                        handler: me.saveMetadata
                    }
                ]
            }
            ]
        });


        this.callParent();
        this.loadThumbnialsAndMetadata();
    },

    loadThumbnialsAndMetadata: function () {
        var me = this;
        var thumbnails = this.getComponent('thumbnails');
        var propertygrid = me.down('propertygrid');
        Ext.Ajax.request({
            method: 'GET',
            url: Ext.util.Cookies.get('service') + '/files/' + me._id,
            callback: function (opts, success, response) {
                if (!success)return;
                var obj = Ext.decode(response.responseText);
                if (!obj.found)return;
                thumbnails.bindStore(Ext.create('Ext.data.Store', {
                    data: obj._source._contents,
                    fields: ['name', 'size', 'contentType', 'itemId']
                }));

                var source = {};
                Ext.Array.each(Ext.Object.getAllKeys(obj._source), function (key) {
                    if (Ext.String.startsWith(key, '_'))return;
                    source[key] = obj._source[key];
                });

                propertygrid.setSource(source, {
                    _createAt: {
                        type: 'date',
                        renderer: function (v) {
                            return Ext.Date.format(new Date(v), 'Y-m-d');
                        }
                    },
                    _createBy: {}
                });

            }
        });


    },

    saveMetadata: function () {
        var me = this.up('imageexplorer');
        var propertygrid = this.up('propertygrid');
        Ext.Ajax.request({
            method: 'POST',
            url: Ext.util.Cookies.get('service') + '/files/' + me._id + '/_update',
            jsonData: {doc: propertygrid.getSource()},
            callback: function (opts, success, response) {
                Ext.toast({
                    html: success?'success':'error',
                    closable: false,
                    align: 't',
                    slideInDuration: 400,
                    minWidth: 400
                });
                if (!success)return;
                var obj = Ext.decode(response.responseText);

            }
        });
    },

    onThumbnialsRefresh: function (view, eOpts) {
        view.isFocusable(false);
        view.getSelectionModel().select(0);

    },

    onSelectionChanged: function (view, selected, eOpts) {
        var explorer = this.up('panel');
        var thumbnails = explorer.getComponent('thumbnails');

        Ext.Array.each(thumbnails.getNodes(), function (node) {
            //node.style['background-color'] = '';
            node.style.border = '3px solid #fff';
        });

        var big = explorer.getComponent('big');
        var image = big.down('image');
        image.setSrc(Ext.util.Cookies.get('service') + '/files/' + explorer._id + '/_content/' + selected[0].get('itemId'))
        var node = thumbnails.getNode(selected[0]);
        //node.style['background-color'] = '#2a3f5d';
        node.style.border = '3px solid #2a3f5d';
    },

    zoomin: function () {
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setWidth(image.getWidth() * 1.1);
        image.setHeight(image.getHeight() * 1.1);
    },

    zoomout: function () {
        var me = this.up('imageexplorer');
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setWidth(image.getWidth() * 0.9);
        image.setHeight(image.getHeight() * 0.9);
    },

    rotateleft: function () {
        var me = this.up('imageexplorer');
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setStyle({
            '-ms-transform': 'rotate(-90deg)', /* IE 9 */
            '-moz-transform': 'rotate(-90deg)', /* Firefox */
            '-webkit-transform': 'rotate(-90deg)', /* Safari and Chrome */
            '-o-transform': 'rotate(-90deg)' /* Opera */
        });
    },

    rotateright: function () {
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setStyle({
            '-ms-transform': 'rotate(90deg)', /* IE 9 */
            '-moz-transform': 'rotate(90deg)', /* Firefox */
            '-webkit-transform': 'rotate(90deg)', /* Safari and Chrome */
            '-o-transform': 'rotate(90deg)' /* Opera */
        });

    },

    fitwidth: function () {
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setStyle({
            'width': (big.getWidth() - 18) + 'px',
            height: 'auto'
        });
    },

    fitheight: function () {
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setStyle({
            'width': 'auto',
            height: (big.getHeight() - 60) + 'px'
        });
    },

    restore: function () {
        var me = this.up('imageexplorer');
        var big = me.getComponent('big');
        var image = big.down('image');
        image.setStyle({
            'width': 'auto',
            height: 'auto',
            '-ms-transform': '',
            '-moz-transform': '',
            '-webkit-transform': '',
            '-o-transform': ''
        });

    },

    first: function () {
        var me = this.up('imageexplorer');
        var thumbnails = me.getComponent('thumbnails');
        thumbnails.getSelectionModel().select(0);
        var node = thumbnails.getNode(thumbnails.getSelection()[0]);
        node.scrollIntoView();

    },

    backward: function () {
        var me = this.up('imageexplorer');
        var thumbnails = me.getComponent('thumbnails');
        var selection = thumbnails.getSelection();
        if (selection || selection > 0) {
            var index = thumbnails.getStore().indexOf(selection[0]);
            thumbnails.getSelectionModel().select(index - 1);
            var node = thumbnails.getNode(thumbnails.getSelection()[0]);
            node.scrollIntoView();
        }
    },

    forward: function () {
        var me = this.up('imageexplorer');
        var thumbnails = me.getComponent('thumbnails');
        var selection = thumbnails.getSelection();
        if (selection || selection > 0) {
            var index = thumbnails.getStore().indexOf(selection[0]);
            thumbnails.getSelectionModel().select(index + 1);
            var node = thumbnails.getNode(thumbnails.getSelection()[0]);
            node.scrollIntoView();
        }

    },

    last: function () {
        var me = this.up('imageexplorer');
        var thumbnails = me.getComponent('thumbnails');
        var count = thumbnails.getStore().getCount();
        thumbnails.getSelectionModel().select(count - 1);
        var node = thumbnails.getNode(thumbnails.getSelection()[0]);
        node.scrollIntoView({block: "end", behavior: "smooth"});
    }


});