describe('ESRISource', function() {
    var e = krite.Sources.ESRISource;
    
    // an example esrisource
    var source = new e('http://services.arcgisonline.com/ArcGIS/rest/services/');

    // a layer that should be present on the source
    var layername = 'World_Topo_Map';
    var layertitle = 'World Topographic Map';

    it('should be defined', function() {
        expect(e).toBeDefined();
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
            expect(layer.title).toBe(layertitle);
            done();
        });
    });

});
