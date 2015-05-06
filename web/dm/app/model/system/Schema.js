Ext.define('dm.model.system.Schema', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '_id', type: 'string'},
        {name: 'description', type: 'string', mapping: '_source.description'},
        {name: 'properties', type: 'auto', mapping: '_source.properties'}
    ],
    idProperty: '_id'

});