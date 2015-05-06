Ext.define('dm.store.system.Schemas', {
    extend: 'Ext.data.Store',
    autoSync: true,
    autoLoad: true,
    model: 'dm.model.system.Schema',

    proxy: Ext.create('dm.data.proxy.ElasticDocument', {
        url: Ext.util.Cookies.get('service') + '/schemas',
        api: {
            read: Ext.util.Cookies.get('service') + '/schemas/_search'
        },
        reader: {
            type: 'json',
            rootProperty: 'hits.hits'
        }
    })

});