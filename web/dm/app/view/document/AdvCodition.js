Ext.define('dm.view.document.AdvCodition', {
    extend: 'Ext.form.Panel',
    fields: [],
    initComponent: function () {
        var me = this;
        me.callParent();

        if (me.down('container'))return;
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/files/_mapping',
            success: function (response) {
                var result = Ext.decode(response.responseText);
                if (result && result.dm) {
                    me.fields = [];
                    Ext.each(Ext.Object.getKeys(result.dm.mappings.files.properties), function (item) {
                        if (!Ext.String.startsWith(item, '_'))
                            me.fields.push(item)

                    });
                    me.initCondition()
                }
            }
        });
    },

    initCondition: function () {
        var me = this;
        me.add({
            xtype: 'container', layout: 'hbox', items: [
                {
                    xtype: 'combo',
                    value: 'must',
                    width: 100,
                    store: ['must', 'must_not']
                }, {
                    xtype: 'combo',
                    store: me.fields
                }, {
                    xtype: 'combo',
                    width: 150,
                    value: 'term',
                    store: ['term', 'wildcard', 'prefix', 'fuzzy', 'range', 'query_string', 'text', 'missing'],
                    listeners: {
                        change: me.conditionChange
                    }
                }, {
                    xtype: 'textfield'
                }, {
                    xtype: 'button',
                    text: '+',
                    handler: me.addCondition
                }, {
                    xtype: 'button',
                    text: 'search',
                    handler: me.sendSearch
                }
            ]
        });
    },

    conditionChange: function (combo, newValue, oldValue, eOpts) {
        var me = combo.up('form');
        var fieldset = combo.up('container');
        if (newValue === 'range') {
            me.clearConditionField(combo, fieldset);
            var range = [{
                xtype: 'combo',
                value: 'from',
                store: ['from', 'gt', 'gte']
            }, {allowBlank: false, xtype: 'textfield'}, {
                xtype: 'combo',
                value: 'to',
                store: ['to', 'lt', 'lte']
            }, {allowBlank: false, xtype: 'textfield'}]
            var nextSibling = combo.nextSibling();
            fieldset.insert(fieldset.items.indexOf(nextSibling), range);
        } else if (newValue === 'missing') {
            me.clearConditionField(combo, fieldset);
        } else {
            me.clearConditionField(combo, fieldset);
            var nextSibling = combo.nextSibling();
            fieldset.insert(fieldset.items.indexOf(nextSibling), {xtype: 'textfield'});
        }

    },

    clearConditionField: function (combo, fieldset) {
        var nextSibling = combo.nextSibling();
        while (nextSibling && nextSibling.xtype !== 'button') {
            fieldset.remove(nextSibling);
            nextSibling = combo.nextSibling();
        }
    },

    addCondition: function () {
        var me = this.up('form');
        me.add({
            xtype: 'container', layout: 'hbox', items: [
                {
                    xtype: 'combo',
                    value: 'must',
                    store: ['must', 'must_not']
                }, {
                    xtype: 'combo',
                    allowBlank: false,
                    store: me.fields
                }, {
                    xtype: 'combo',
                    value: 'term',
                    store: ['term', 'wildcard', 'prefix', 'fuzzy', 'range', 'query_string', 'text', 'missing'],
                    listeners: {
                        change: me.conditionChange
                    }
                }, {
                    allowBlank: false,
                    xtype: 'textfield'
                }, {
                    xtype: 'button',
                    text: '-',
                    handler: me.removeCondition
                }, {
                    xtype: 'button',
                    text: '+',
                    handler: me.addCondition
                }
            ]
        });
    },

    removeCondition: function () {
        var me = this.up('form');
        me.remove(this.up('container'));
    },

    buildCondition: function (primary, fieldset, query) {
        var key = fieldset.items.getAt(2).value;
        var field = fieldset.items.getAt(1).value;
        if (Ext.Array.contains(['term', 'wildcard', 'prefix', 'query_string', 'text'], key)) {
            var condition = {};
            condition[key] = {};
            condition[key][field] = fieldset.items.getAt(3).value;
            query.bool[primary].push(condition)
        } else if (key === 'fuzzy') {
            var condition = {};
            condition.fuzzy = {};
            condition.fuzzy[field] = {value: fieldset.items.getAt(3).value};
            query.bool[primary].push(condition);
        } else if (key === 'range') {
            var condition = {};
            condition.range = {};
            var form = fieldset.items.getAt(3).value, to = fieldset.items.getAt(5).value;
            var formValue = fieldset.items.getAt(4).value, toValue = fieldset.items.getAt(6).value
            condition.range[field] = {};
            condition.range[field][form] = formValue;
            condition.range[field][to] = toValue;
            query.bool[primary].push(condition);
        } else if (key === 'missing') {
            query.bool[primary].push({
                constant_score: {
                    filter: {
                        missing: {
                            field: field
                        }
                    }
                }
            });
        }
    },

    sendSearch: function () {
        var me = this.up('form');
        if (!me.getForm().isValid())return;
        var query = {bool: {must: [], must_not: []}};
        me.items.each(function (comp) {
            if (comp.xtype !== 'container')return;
            var fieldset = comp;
            me.buildCondition(fieldset.items.getAt(0).value, fieldset, query);
        });
        me.up('panel').search(query);
    }

});