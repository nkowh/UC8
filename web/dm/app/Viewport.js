Ext.define('dm.Viewport', {
    extend: 'Ext.container.Viewport',
    layout: 'border',
    requires: [
        'Ext.layout.container.Border'
    ],

    bodyBorder: false,

    defaults: {
        collapsible: false,
        split: true
    },

    items: [
        //Ext.create('dm.view.Header', {
        //    region: 'north',
        //    margin: '0 0 0 0'
        //}),
        Ext.create('dm.view.TreeMenu', {
            region: 'west',
            floatable: false,
            margin: '5 0 0 0',
            width: 225,
            minWidth: 100,
            maxWidth: 250
        }),
        {
            header: false,
            layout: 'fit',
            id: 'mainpanel',
            region: 'center',
            margin: '5 0 0 0'
        }
    ]

});