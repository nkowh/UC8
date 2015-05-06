Ext.define('dm.model.system.Group', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '_id', type: 'string'},
        {name: 'display', type: 'string', mapping: '_source.display'},
        {name: 'createAt', type: 'date', dateFormat: 'time', mapping: '_source.createAt'}
    ],
    idProperty: '_id'

});