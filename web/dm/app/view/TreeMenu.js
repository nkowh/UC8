Ext.define('dm.view.TreeMenu', {
    extend: 'Ext.tree.Panel',
    rootVisible: false,

    root: {
        expanded: true,
        children: [
            {
                text: "文档", iconCls: 'fa-server', expanded: true, children: [
                {text: "创建文档", iconCls: 'fa-cloud-upload', ref: 'dm.view.document.Upload', leaf: true},
                {
                    text: "我的文档",
                    iconCls: 'fa-files-o',
                    ref: 'dm.view.document.MyDocument',
                    leaf: true
                },
                {text: "我的关注", iconCls: 'fa-tags', ref: 'dm.view.document.MyFavorite', leaf: true},
                {text: "全文搜索", iconCls: 'fa-search', ref: 'dm.view.document.FullTextSearch', leaf: true},
                {
                    text: "高级搜索",
                    icon: '<i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-search fa-stack-1x fa-inverse"></i>',
                    ref: 'dm.view.document.AdvSearch',
                    leaf: true
                }
            ]
            },
            {
                text: "监控", iconCls: 'fa-lightbulb-o', expanded: true, children: [
                {text: '集群', iconCls: 'fa-th-large', ref: 'dm.view.monitor.Cluster', leaf: true}
            ]
            },
            {
                text: "系统", iconCls: 'fa-cog', expanded: true, children: [
                {text: "用戶", iconCls: 'fa-user', ref: 'dm.view.system.Users', leaf: true},
                {text: "组", iconCls: 'fa-users', ref: 'dm.view.system.Groups', leaf: true},
                {text: "Schema", iconCls: 'fa-list-alt', ref: 'dm.view.system.Schemas', leaf: true},
                {text: "权限", iconCls: 'fa-sliders', ref: 'dm.view.system.Acls', leaf: true},
                {text: "初始化", iconCls: 'fa-eraser', ref: 'dm.view.system.Initialization', leaf: true}

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
                iconCls = record.get('iconCls'),
                icon = record.get('icon'),
                glyph = record.get('glyph'),
                ref = record.get('ref');
            if (!leaf) return;
            var mainpanel = Ext.getCmp('mainpanel');
            mainpanel.removeAll(true);
            if (ref) {
                var title = text
                if (icon)title = '<span style="color: black;font-weight: bold" ><span class="fa-stack">' + icon + '</span><span style="font-size: larger">' + text + '</span><span>';
                else if (iconCls)title = '<span style="color: black;font-weight: bold" ><span class="fa ' + iconCls + ' fa-lg fa-fw" ></span><span style="font-size: larger">' + text + '</span></span>';
                mainpanel.add(Ext.create(ref, {
                    title: title,
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
            }],
            columns: [{
                xtype: 'treecolumn',
                text: 'Name',
                flex: 1,
                dataIndex: me.displayField,
                cellTpl: [
                    '<tpl for="lines">',
                    '<img src="{parent.blankUrl}" class="{parent.childCls} {parent.elbowCls}-img ',
                    '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>" role="presentation"/>',
                    '</tpl>',
                    '<img src="{blankUrl}" class="{childCls} {elbowCls}-img {elbowCls}',
                    '<tpl if="isLast">-end</tpl><tpl if="expandable">-plus {expanderCls}</tpl>" role="presentation"/>',
                    '<tpl if="checked !== null">',
                    '<input type="button" {ariaCellCheckboxAttr}',
                    ' class="{childCls} {checkboxCls}<tpl if="checked"> {checkboxCls}-checked</tpl>"/>',
                    '</tpl>',
                    '<tpl if="icon"><span role="presentation" class="fa-stack">{icon}</span><tpl elseif="iconCls"><span role="presentation"><i class="fa {iconCls} fa-lg fa-fw"></i></span><tpl else>',
                    '<img src="{blankUrl}" role="presentation" class="{childCls} {baseIconCls} ',
                    '{baseIconCls}-<tpl if="leaf">leaf<tpl else>parent</tpl> {iconCls}"',
                    '<tpl if="icon">style="background-image:url({icon})"</tpl>/></tpl>',
                    '<tpl if="href">',
                    '<a href="{href}" role="link" target="{hrefTarget}" class="{textCls} {childCls}">{value}</a>',
                    '<tpl else>',
                    '<span class="{textCls} {childCls}">{value}</span>',
                    '</tpl>'
                ]
            }]
        })


        this.callParent();
    }


});