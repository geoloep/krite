describe('GeoserverLayer', function () {
    // setup required objects
    krite.ServicePool.addService('ProjectService', new krite.Services.ProjectService(L.CRS.RD, L.Projection.RD.proj4def));

    var s = krite.Sources.OWSSource;

    // This should point to a Geoserver instance with wfs enabled
    var source = new s('http://service.geoloep.nl/geoserver/gemeenten/ows');
    var layername = 'Gemeentehuizen';

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

    beforeAll(function (done) {
        source.getLayer(layername).then(function (l) {
            layer = l;
            done();
        });
    });

    it('it should be defined', function () {
        expect(layer).toBeDefined();
        expect(layer.title).toBe(layername);
    });

    it('should not have onClick events', function () {
        expect(layer.hasOnClick).toBeFalsy();
    });

    it('has operations', function () {
        expect(layer.hasOperations).toBeTruthy();
    });

    it('intersects points exactly', function (done) {
        layer.intersectsPoint(point).then(function (r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });

    it('intersects points loosely', function (done) {
        var loosePoint = new L.Point(point.x + 1, point.y + 1);

        layer.intersectsPoint(loosePoint).then(function (r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });

    it('intersects with polygons', function (done) {
        layer.intersects(polygon).then(function (r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });

    it('filters', function (done) {
        layer.filter({
            naam: 'Gemeente Groningen'
        }).then(function (r) {
            expect(r).toBeDefined();
            expect(r.totalFeatures).toBe(1);
            expect(r.features[0].properties[property]).toBe(value);

            done();
        });
    });
});