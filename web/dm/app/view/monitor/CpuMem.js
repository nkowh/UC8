Ext.define('dm.view.monitor.CpuMem', {
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
                fields: [ 'cpu_usage', 'mem_usage', 'heap_usage'],
                position: 'left',
                grid: true,
                minimum: 0,
                maximum: 100
            }],
            series: [{
                type: 'line',
                xField: 'timestamp',
                yField: 'mem_usage',
                fill: true
            },{
                type: 'line',
                xField: 'timestamp',
                yField: 'heap_usage',
                fill: true
            },
                {
                    type: 'line',
                    xField: 'timestamp',
                    yField: 'cpu_usage',
                    style: {
                        lineWidth: 4
                    },
                    marker: {
                        radius: 4
                    }
                }]
        }];

        me.callParent();

    },

    refresh: function (data) {
        var cartesian = this.down('cartesian');
        cartesian.setStore(Ext.create('Ext.data.JsonStore', {
            fields: ['timestamp', 'cpu_usage', 'mem_usage', 'heap_usage'], data: data
        }));
    }


});