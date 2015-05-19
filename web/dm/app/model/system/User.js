Ext.define('dm.model.system.User', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '_id', type: 'string'},
        {name: 'display', type: 'string', mapping: '_source.display'},
        {name: 'password', type: 'string', mapping: '_source.password'},
        {name:'favorite',type:'auto',mapping:'_source.favorite'},
        {name:'search',type:'auto',mapping:'_source.search'},
        {name: 'createAt', type: 'date', dateFormat: 'time', mapping: '_source.createAt'}
    ],
    idProperty: '_id',


    proxy: Ext.create('dm.data.proxy.ElasticDocument',{
        type: 'rest',
        url: Ext.util.Cookies.get('service') + '/users',
        reader: {
            type: 'json'
        }
    })


});