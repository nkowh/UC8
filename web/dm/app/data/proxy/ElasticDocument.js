Ext.define('dm.data.proxy.ElasticDocument', {
    extend: 'Ext.data.proxy.Ajax',

    startParam:'',
    limitParam:'',
    pageParam:'',

    actionMethods: {
        create: 'POST',
        read: 'GET',
        update: 'POST',
        destroy: 'DELETE'
    },

    slashRe: /\/$/,
    periodRe: /\.$/,


    buildUrl: function (request) {
        var me = this,
            operation = request.getOperation(),
            records = operation.getRecords(),
            record = records ? records[0] : null,
            url = me.getUrl(request),
            id, params;


        if (record && (operation.action === 'create' || !record.phantom)) {
            id = record.getId();
        } else {
            id = operation.getId();
        }

        if (me.isValidId(id)) {
            if (!url.match(me.slashRe)) {
                url += '/';
            }

            url += encodeURIComponent(id);
            params = request.getParams();
            if (params) {
                delete params[me.getIdParam()];
            }
        }

        if (operation.action === 'update') {
            if (!url.match(me.slashRe)) {
                url += '/';
            }
            url += '_update';
        }

        request.setUrl(url);

        return me.callParent([request]);
    },

    isValidId: function (id) {
        return id || id === 0;
    },

    doRequest: function (operation) {
        var me = this,
            writer = me.getWriter(),
            request = me.buildRequest(operation),
            method = me.getMethod(request),
            jsonData, params;

        if (writer && operation.allowWrite()) {
            request = writer.write(request);
        }

        request.setConfig({
            binary: me.getBinary(),
            headers: me.getHeaders(),
            timeout: me.getTimeout(),
            scope: me,
            callback: me.createRequestCallback(request, operation),
            method: method,
            useDefaultXhrHeader: me.getUseDefaultXhrHeader(),
            disableCaching: false // explicitly set it to false, ServerProxy handles caching
        });

        if (method.toUpperCase() !== 'GET' && me.getParamsAsJson()) {
            params = request.getParams();

            if (params) {
                jsonData = request.getJsonData();
                if (jsonData) {
                    jsonData = Ext.Object.merge({}, jsonData, params);
                } else {
                    jsonData = params;
                }
                request.setJsonData(jsonData);
                request.setParams(undefined);
            }
        }

        if (me.getWithCredentials()) {
            request.setWithCredentials(true);
            request.setUsername(me.getUsername());
            request.setPassword(me.getPassword());
        }

        if (request.getAction() === 'update') {
            var updateParams = {doc: request.getJsonData()}
            request.setJsonData(updateParams);
        }
        return me.sendRequest(request);
    }
});