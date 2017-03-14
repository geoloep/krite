describe('GeoserverLayer', function() {
    var s = krite.Sources.GeoServerSource;

    // This should point to a Geoserver instance with wfs enabled
    var source = new s('http://service.geoloep.nl/geoserver/gemeenten/ows');
    var layername = 'gemeentehuizen';

    var layer;

    // A point in the wfs
    var point = new L.Point(233818, 581974);
    var polygon = {
        type: 'Polygon',
        coordinates: [
            [
                [233817, 581975],
                [233819, 581975],
                [233819, 581973],
                [233817, 581973],
                [233817, 581975],
            ]
        ]
    };

    var property = 'naam';
    var value = 'Gemeente Groningen';

    beforeAll(function(done) {
        source.getLayer(layername).then(function(l) {
            layer = l;
            done();
        });
    });

    it('it should be defined', function() {
        expect(layer).toBeDefined();
        expect(layer.name).toBe(layername);
    });

    it('should not have onClick events', function() {
        expect(layer.hasOnClick).toBeFalsy();
    });

    it('can get info at a point', function() {
        expect(layer.canGetInfoAtPoint).toBeTruthy();
    });

    it('has operations', function() {
        expect(layer.hasOperations).toBeTruthy();
    });

    it('intersects points exactly', function(done) {
        layer.intersectsPoint(point).then(function(r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });

    it('intersects points loosely', function(done) {
        var losePoint = new L.Point(point.x + 1, point.y + 1);

        layer.intersectsPoint(losePoint).then(function(r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });

    it('intersects with polygons', function(done) {
        layer.intersects(polygon).then(function(r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });
});