Ext.define('dm.model.system.Acl', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '_id', type: 'string'},
        {name: 'acl', type: 'auto', mapping: '_source.acl'},
        {name: 'createAt', type: 'date', dateFormat: 'time', mapping: '_source._createAt'}
    ],
    idProperty: '_id'

});