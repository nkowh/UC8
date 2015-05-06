Ext.define('dm.data.reader.Elastic', {
    extend: 'Ext.data.reader.Json',

    readRecords: function (data, readOptions) {
        var me = this;
        if (!data.hits || !data.hits.hits) {
            return me.callParent([[], readOptions]);
        }
        var dest = [];
        Ext.each(data.hits.hits, function (item) {
            dest.push(_.extend({
                '_index': item._index,
                '_type': item._type,
                '_id': item._id,
                '_score': item._score
            }, item._source));
        });

        return me.callParent(dest, readOptions);
    }


});