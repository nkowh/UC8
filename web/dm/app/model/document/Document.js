Ext.define('dm.model.document.Document', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '_id', type: 'string'},
        {name: '_source', type: 'auto'},
        {name: 'highlight', type: 'auto'}
    ],
    idProperty: '_id'

});