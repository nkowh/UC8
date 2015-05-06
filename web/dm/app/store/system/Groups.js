Ext.define('dm.store.system.Groups', {
    extend: 'Ext.data.Store',
    autoSync: true,
    autoLoad: true,
    model: 'dm.model.system.Group',

    proxy: Ext.create('dm.data.proxy.ElasticDocument', {
        url: Ext.util.Cookies.get('service') + '/groups',
        api: {
            read: Ext.util.Cookies.get('service') + '/groups/_search'
        },
        reader: {
            type: 'json',
            rootProperty: 'hits.hits'
        }
    })

});