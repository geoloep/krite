describe('WFSLayer', function() {
    var s = krite.Sources.WFSSource;

    // This should point to a wfs data source
    var source = new s('http://service.geoloep.nl/geoserver/gemeenten/ows');
    var layername = 'Gemeentehuizen';

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

    it('should have onClick events', function() {
        expect(layer.hasOnClick).toBeTruthy();
    });
});