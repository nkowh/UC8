Ext.define('dm.view.TreeMenu', {
    extend: 'Ext.tree.Panel',
    rootVisible: false,

    root: {
        expanded: true,
        children: [
            {
                text: "文档", expanded: true, children: [
                {text: "创建文档", ref: 'dm.view.document.Upload', leaf: true},
                {text: "我的文档", ref: 'dm.view.document.MyDocument', leaf: true},
                {text: "我的关注", ref: 'dm.view.document.MyFavorite', leaf: true},
                {text: "全文搜索", ref: 'dm.view.document.FullTextSearch', leaf: true},
                {text: "高级搜索", ref: 'dm.view.document.AdvSearch', leaf: true}
            ]
            },
            {
                text: "监控", expanded: true, children: [
                {text: '集群', ref: 'dm.view.monitor.Cluster', leaf: true}
            ]
            },
            {
                text: "系统", expanded: true, children: [
                {text: "用戶", ref: 'dm.view.system.Users', leaf: true},
                {text: "组", ref: 'dm.view.system.Groups', leaf: true},
                {text: "Schema", ref: 'dm.view.system.Schemas', leaf: true},
                {text: "权限", ref: 'dm.view.system.Acls', leaf: true},
                {
                    text: "高级", expanded: true, children: [
                    {text: "初始化", ref: 'dm.view.system.Initialization', leaf: true},
                    {text: "索引", leaf: true}
                ]
                },
            ]
            }
        ]
    },

    listeners: {
        selectionchange: function (tree, selected, eOpts) {
            var me = tree;
            var record = selected[0],
                text = record.get('text'),
                leaf = record.get('leaf'),
                ref = record.get('ref');
            if (!leaf) return;
            var mainpanel = Ext.getCmp('mainpanel');
            mainpanel.removeAll(true);
            if (ref) {
                mainpanel.add(Ext.create(ref, {
                    title: text,
                    titleAlign: 'center'
                }));
            } else {
                mainpanel.add(Ext.create('dm.view.Developing', {
                    title: text,
                    titleAlign: 'center'
                }))
            }

        }
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            header: {
                xtype: 'panel', header: false, layout: 'fit', items: [
                    {
                        xtype: 'button',
                        text: 'DM @ ' + Ext.util.Cookies.get('username'),
                        scale: 'large',
                        glyph: 0xf015,
                        menuAlign: 'tr-br?',
                        menu: [{
                            text: '我的信息'
                        }, {
                            text: '修改密码'
                        }, {
                            text: '退出',
                            handler: function (item, e) {
                                var mask = Ext.create('Ext.LoadMask', {
                                    msg: '刷新中...',
                                    target: me.up('viewport')
                                });
                                mask.show();
                                Ext.util.Cookies.clear('username');
                                Ext.util.Cookies.clear('service');
                                window.location.reload();
                            }
                        }]
                    }
                ]
            },
            tool: [{
                text: 'All Posts',
                xtype: 'cycle',
                reference: 'filterButton',
                showText: true,
                width: 150,
                textAlign: 'left',

                listeners: {
                    change: 'onNewsClick'
                },

                menu: {
                    id: 'news-menu',
                    items: [{
                        text: 'All Posts',
                        type: 'all',
                        itemId: 'all',
                        checked: true
                    }, {
                        text: 'News',
                        type: 'news',
                        itemId: 'news'
                    }, {
                        text: 'Forum',
                        type: 'forum',
                        itemId: 'forum'
                    }]
                }
            }]
        })


        this.callParent();
    }


});