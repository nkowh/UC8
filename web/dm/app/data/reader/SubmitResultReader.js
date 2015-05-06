Ext.define('dm.data.reader.SubmitResultReader', {
    extend: 'Ext.data.reader.Json',

    read: function(response, readOptions) {
        var data, result;

        if (response) {
            if (response.responseText) {
                result = this.getResponseData(response);
                if (result && result.__$isError) {
                    return new Ext.data.ResultSet({
                        total  : 0,
                        count  : 0,
                        records: [],
                        success: false,
                        message: result.msg
                    });
                } else {
                    data = this.readRecords(result, readOptions);
                }
            } else {
                data = this.readRecords(response, readOptions);
            }
        }

        return data || this.nullResultSet;
    }


});