Ext.define('dm.store.document.Documents', {
    extend: 'Ext.data.Store',
    autoSync: true,
    autoLoad: true,
    model: 'dm.model.document.Document',

    proxy: Ext.create('dm.data.proxy.ElasticDocument', {
        paramsAsJson: true,
        actionMethods: {
            create: 'POST',
            read: 'POST',
            update: 'POST',
            destroy: 'DELETE'
        },
        url: Ext.util.Cookies.get('service') + '/files',
        api: {
            read: Ext.util.Cookies.get('service') + '/files/_search'
        },
        reader: {
            type: 'json',
            rootProperty: 'hits.hits'
        }
    })

});