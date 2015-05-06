Ext.setGlyphFontFamily('FontAwesome');
Ext.Ajax.cors = true;

Ext.application({
    name: 'dm',

    launch: function () {
        document.title = "uContent"
        Ext.onReady(function () {
            if (!Ext.util.Cookies.get('username') || !Ext.util.Cookies.get('service')) {
                var login = Ext.create('Ext.window.Window', {
                    title: 'uContent DM', titleAlign: 'center', closable: false, modal: true, items: [
                        Ext.create('dm.view.Login')
                    ]
                });
                login.on('close', function () {
                    Ext.create('dm.Viewport');
                });
                login.show();
            } else {
                Ext.create('dm.Viewport');
            }

        });
    }


});