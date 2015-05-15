Ext.define('dm.view.monitor.Disk', {
    extend: 'Ext.Panel',

    initComponent: function () {
        var me = this;

        me.items = [{
            xtype: 'cartesian',
            width: '100%',
            height: 500,
            interactions: {
                type: 'panzoom',
                zoomOnPanGesture: true
            },
            legend: {
                docked: 'bottom'
            },
            axes: [{
                type: 'numeric',
                fields: ['disk_read', 'disk_write'],
                position: 'left',
                grid: true
            }],
            series: [{
                type: 'line',
                xField: 'timestamp',
                yField: 'disk_read',
                style: {
                    lineWidth: 4
                }
            }, {
                type: 'line',
                xField: 'timestamp',
                yField: 'disk_write',
                style: {
                    lineWidth: 4
                }
            }]
        }];

        me.callParent();

    },

    refresh: function (data) {
        var cartesian = this.down('cartesian');
        cartesian.setStore(Ext.create('Ext.data.JsonStore', {
            fields: ['timestamp', 'disk_read', 'disk_write'], data: data
        }));
    }


});