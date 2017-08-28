describe('WMTSSource', function() {
    // setup required objects
    krite.ServicePool.addService('ProjectService', new krite.Services.ProjectService(L.CRS.RD, L.Projection.RD.proj4def));    

    var s = krite.Sources.WMTSSource;
    var source = new s('https://geodata.nationaalgeoregister.nl/wmts/');
    var layername = 'brtachtergrondkaart';

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
            expect(layer.title).toBe(layername);
            done();
        });
    });

});
