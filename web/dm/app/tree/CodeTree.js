Ext.define('dm.tree.CodeTree', {
    extend: 'Ext.tree.Panel',

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
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
        });

        if (me.code)this.root = me.buildJsonTree({children: []}, me.code);

        this.callParent();
    },

    buildJsonTree: function (node, obj) {
        var me = this;
        Ext.Object.each(obj, function (key, value) {
            if (Ext.isObject(value))
                node.children.push(me.buildJsonTree({text: key, children: []}, obj[key]));
            else if (Ext.isArray(value)) {
                var arr = {text: key, children: []};
                Ext.each(value, function (item, index) {
                    arr.children.push(me.buildJsonTree({text: index, children: []}, item));
                });
                node.children.push(arr);
            }
            else
                node.children.push({
                    text: '<i>' + key + '</i> : <span style="color: #006600;">' + value + '</span>',
                    iconCls: 'fa-leaf',
                    leaf: true
                });
        });
        return node;
    },

    bindCode: function (code) {
        this.setStore(Ext.create('Ext.data.TreeStore', {
            root: this.buildJsonTree({children: []}, code)
        }));
    }


});