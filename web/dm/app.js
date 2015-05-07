Ext.setGlyphFontFamily('FontAwesome');
Ext.Ajax.cors = true;

Ext.application({
    name: 'dm',

    launch: function () {
        document.title = "uContent"
        Ext.onReady(function () {
            if (!Ext.util.Cookies.get('username') || !Ext.util.Cookies.get('service')) {
                var random = Ext.Number.randomInt(0, 4);
                Ext.create('Ext.container.Viewport', {
                    layout: 'center',
                    items: [
                        Ext.create('dm.view.Login')
                    ],
                    style: {
                        'background-image': 'url("../lib/images/BingWallpaper-' + random + '.jpg")'
                    }
                });


            } else {
                Ext.create('dm.Viewport');
            }

        });
    }


});