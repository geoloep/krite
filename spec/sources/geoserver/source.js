describe('GeoServerSource', function() {
    var s = krite.Sources.GeoServerSource;
    var source = new s('http://service.geoloep.nl/geoserver/gemeenten/ows');
    var layername = 'gemeentehuizen';

    it('should be defined', function() {
        expect(s).toBeDefined();
    });

    it('should have the layer name', function(done) {
        source.getLayerNames().then(function(layers) {
            expect(layers.indexOf(layername)).toBeGreaterThan(-1);
            done();
        });
    });

    it('should return a layer by name', function(done) {
        source.getLayer(layername).then(function(layer) {
            expect(layer.name).toBe(layername);
            done();
        });
    });

});
