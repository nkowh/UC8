Ext.define('dm.view.document.FullTextSearch', {
   extend: 'dm.grid.DocumentGrid',
   // extend: 'Ext.grid.Panel',
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            tbar: [
                {
                    xtype: 'textfield',
                    name: 'text',
                    allowBlank: false
                },
                {
                    xtype: 'button',
                    text: 'search',
                    scope: me,
                    handler: this.fulltextSearch
                }
            ],
            listeners: {
                beforerender: function () {
                    dm.model.system.User.load(Ext.util.Cookies.get('username'), {
                        callback: function (user, operation, success) {
                            if (!success)return;
                            me.user = user;
                        }
                    });
                }
            }
        });

        me.callParent();


    },


    fulltextSearch: function () {
        var me = this;

        var keywords = me.down('textfield[name=text]').getValue();
        var q = {
            size: 50,
            "query": {
                "bool": {
                    "must": [
                        {match: {'_all': keywords}},
                        {
                            "nested": {
                                "path": "_acl",
                                "query": {
                                    "bool": {
                                        "must": [
                                            {"match": {"_acl.permissions": "read"}},
                                            {"match": {"_acl.users": Ext.util.Cookies.get('username')}}
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
            //"highlight": {
            //    //"pre_tags": ['<span class="text-danger">'],
            //    //"post_tags": ['</span>'],
            //    "fields": {
            //        "*": {}
            //    }
            //}
        };
        me.search(q);
    }


})
;