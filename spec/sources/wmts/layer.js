describe('WMTSLayer', function() {
    var s = krite.Sources.WMTSSource;

    // This should point to a wmts data source
    var source = new s('https://geodata.nationaalgeoregister.nl/wmts/');
    var layername = 'brtachtergrondkaart';

    var layer;

    beforeAll(function(done) {
        source.getLayer(layername).then(function(l) {
            layer = l;
            done();
        });
    });

    it('it should be defined', function() {
        expect(layer).toBeDefined();
        expect(layer.title).toBe(layername);
    });
});