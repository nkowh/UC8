Ext.define('dm.view.document.AdvCodition', {
    extend: 'Ext.container.Container',
    itemId: 'AdvCodition',
    requires: ['dm.model.system.User'],
    fields: [],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },


    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [{
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {xtype: 'textfield'},
                    {
                        xtype: 'button',
                        glyph: 0xf0c7,
                        scope: me,
                        handler: me.save
                    },
                    {
                        xtype: 'combo', itemId: 'search_combo',
                        allowBlank: false,
                        displayField: 'name',
                        valueField: 'query',
                        forceSelection: true,
                        listeners: {
                            change: function (combo, newValue, oldValue, eOpts) {
                                me.loadQuery(newValue)
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        glyph: 0xf057,
                        scope: me,
                        handler: me.remove
                    },
                ]
            }, {
                xtype: 'form',
                listeners: {add: me.conditionAdded}
            }],
            listeners: {
                beforerender: function () {
                    dm.model.system.User.load(Ext.util.Cookies.get('username'), {
                        callback: function (user, operation, success) {
                            if (!success)return;
                            me.user = user;
                            var search_combo = me.down('combo[itemId=search_combo]');
                            search_combo.setStore(Ext.create('Ext.data.Store', {
                                fields: ['name', 'query'],
                                data: user.get('search')
                            }));

                        }
                    });
                }
            }
        });


        me.callParent();

        //if (me.down('form'))return;
        Ext.Ajax.request({
            url: Ext.util.Cookies.get('service') + '/files/_mapping',
            callback: function (operation, success, response) {
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
        me.down('container').add({
            xtype: 'container', layout: 'hbox', items: [
                {
                    xtype: 'button',
                    scope: me,
                    text: '+',
                    handler: me.addCondition
                }, {
                    xtype: 'button',
                    scope: me,
                    text: 'search',
                    handler: me.sendSearch
                }
            ]
        });
    },

    conditionChange: function (combo, newValue, oldValue, eOpts) {
        var form = combo.up('form');
        var me = form.up('container');
        var fieldset = combo.up('container');
        if (newValue === 'range') {
            me.clearConditionField(combo, fieldset);
            var range = [{
                xtype: 'combo',
                width: 100,
                value: 'from',
                store: ['from', 'gt', 'gte']
            }, {allowBlank: false, xtype: 'textfield', name: 'from'}, {
                xtype: 'combo',
                width: 100,
                value: 'to',
                store: ['to', 'lt', 'lte']
            }, {allowBlank: false, xtype: 'textfield', name: 'to'}]
            var nextSibling = combo.nextSibling();
            fieldset.insert(fieldset.items.indexOf(nextSibling), range);
        } else if (newValue === 'missing') {
            me.clearConditionField(combo, fieldset);
        } else {
            me.clearConditionField(combo, fieldset);
            var nextSibling = combo.nextSibling();
            fieldset.insert(fieldset.items.indexOf(nextSibling), {xtype: 'textfield', name: 'value'});
        }

    },

    clearConditionField: function (combo, fieldset) {
        var nextSibling = combo.nextSibling();
        while (nextSibling && nextSibling.xtype !== 'button') {
            fieldset.remove(nextSibling);
            nextSibling = combo.nextSibling();
        }
    },

    addCondition: function (must, condition) {
        var me = this;
        var form = me.down('form')
        form.add({
            xtype: 'container', layout: 'hbox',
            condition: condition.type ? undefined : condition,
            items: [
                {
                    xtype: 'combo',
                    width: 100,
                    value: must === false ? 'must_not' : 'must',
                    store: ['must', 'must_not']
                }, {
                    xtype: 'combo',
                    allowBlank: false,
                    name: 'key',
                    store: me.fields
                }, {
                    xtype: 'combo',
                    width: 150,
                    name: 'class',
                    store: ['term', 'wildcard', 'prefix', 'fuzzy', 'range', 'query_string', 'text', 'missing'],
                    listeners: {
                        change: me.conditionChange
                    }
                }, {
                    allowBlank: false,
                    name: 'value',
                    xtype: 'textfield'
                }, {
                    xtype: 'button',
                    text: '-',
                    scope: me,
                    handler: me.removeCondition
                }
            ]
        });
    },


    conditionAdded: function (container, component, index, eOpts) {
        if (!component.condition)return;
        var condition = component.condition;
        var me = container.up('container')
        var clazz = me.getClass(condition);
        var key = me.getKey(condition);
        component.down('combo[name=class]').setValue(clazz);
        component.down('combo[name=key]').setValue(key);
        if (clazz === 'range') {
            var c = condition[clazz][key]
            component.down('textfield[name=from]').setValue(c.from || c.gt || c.gte);
            component.down('textfield[name=to]').setValue(c.to || c.lt || c.lte);
        } else {
            var v = component.down('textfield[name=value]');
            v && v.setValue(condition[clazz][key]);
        }
    },

    getClass: function (obj) {
        var res = Ext.Array.findBy(Ext.Object.getAllKeys(obj), function (key) {
            return Ext.Array.contains(['term', 'wildcard', 'prefix', 'fuzzy', 'range', 'query_string', 'text'], key)
        });
        if (res)return res;
        return 'missing';

    },

    getKey: function (obj) {
        var res = Ext.Array.findBy(Ext.Object.getAllKeys(obj), function (key) {
            return Ext.Array.contains(['term', 'wildcard', 'prefix', 'fuzzy', 'range', 'query_string', 'text'], key)
        });
        if (res)
            return Ext.Object.getAllKeys(obj[res])[0];
        else
            return obj.constant_score.filter.missing.field;

    },

    removeCondition: function (button) {
        var form = this.down('form');
        form.remove(button.up('container'));
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
        var me = this;
        var form = me.down('form')
        if (!form.getForm().isValid())return;
        var query = {bool: {must: [], must_not: []}};
        form.items.each(function (comp) {
            var fieldset = comp;
            if (fieldset.xtype !== 'container' || fieldset.items.getAt(0).xtype === 'button')return;
            me.buildCondition(fieldset.items.getAt(0).value, fieldset, query);
        });
        me.queryDsl = query;
        me.up('panel').search(query);
    },

    loadQuery: function (query) {
        var me = this;
        me.down('form').removeAll();
        Ext.Array.each(query.bool.must, function (item) {
            me.addCondition(true, item);
        })

    },

    save: function (button) {
        var me = this;
        var textfield = button.previousSibling('textfield');
        if (!me.queryDsl)return;

        var search = Ext.isArray(me.user.get('search')) ? Ext.Array.clone(me.user.get('search')) : [];
        search.push({name: textfield.getValue(), query: me.queryDsl});
        me.user.set('search', Ext.Array.unique(search));
        me.user.save().setCallback(function(records, op, success){

            dm.model.system.User.load(Ext.util.Cookies.get('username'), {
                callback: function (user, operation, success) {
                    if (!success)return;
                    me.user = user;
                    var search_combo = me.down('combo[itemId=search_combo]');
                    search_combo.setStore(Ext.create('Ext.data.Store', {
                        fields: ['name', 'query'],
                        data: user.get('search')
                    }));

                }
            });
        });

    },

    remove: function () {
        var me = this;
        var selection = me.down('combo[itemId=search_combo]').getSelection();
        if (!selection)return;
        var search = Ext.isArray(me.user.get('search')) ? Ext.Array.clone(me.user.get('search')) : [];
        var reomveItem = Ext.Array.findBy(search, function (item) {
            return item.name === selection.get('name');
        });
        Ext.Array.remove(search, reomveItem);

        me.user.set('search', Ext.Array.unique(search));
        me.user.save();

    }

});