Ext.define('dm.store.system.Acls', {
    extend: 'Ext.data.Store',
    autoSync: true,
    autoLoad: true,
    model: 'dm.model.system.Acl',

    proxy: Ext.create('dm.data.proxy.ElasticDocument', {
        url: Ext.util.Cookies.get('service') + '/acls',
        api: {
            read: Ext.util.Cookies.get('service') + '/acls/_search'
        },
        reader: {
            type: 'json',
            rootProperty: 'hits.hits'
        }
    })

});