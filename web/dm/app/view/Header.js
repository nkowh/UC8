Ext.define('dm.view.Header', {
    extend: 'Ext.panel.Panel',
    //title: 'Ext JS Kitchen Sink',
    header: false,

    layout: {
        type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },

    initComponent: function () {
        document.title = this.title;
        this.bodyStyle = "background: transparent";

        this.tbar = [
            {
                xtype: 'label',
                html: '<h4>Nikoyo uContent</h4>',
                flex: 1

            },
            {xtype: 'component', flex: 1},
            {
                flex: 1,
                xtype: 'segmentedbutton',
                reference: 'positionBtn',
                value: 'top',
                defaultUI: 'default',
                items: [{
                    text: Ext.util.Cookies.get('username'),
                    value: 'top'
                }, {
                    text: 'Right',
                    value: 'right'
                }, {
                    text: 'Bottom',
                    value: 'bottom'
                }, {
                    text: 'Left',
                    value: 'left'
                }]
            },

        ];

        this.callParent();
    }
});
