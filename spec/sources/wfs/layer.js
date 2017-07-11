/*describe('WFSLayer', function () {
    var l = krite.Sources.WFSLayer;

    // This should point to a wfs data source
    var layername = 'gemeentehuizen';

    var layer = new l({
        crs: L.CRS.RD,
        url: 'http://service.geoloep.nl/geoserver/gemeenten/ows',
        typeNS: 'gemeenten',
        typeName: 'gemeentehuizen',
        geometryField: 'punt',
    });

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

    it('it should be defined', function () {
        expect(l).toBeDefined();
        expect(layer).toBeDefined();
        expect(layer.title).toBe(layername);
    });

    it('should have onClick events', function () {
        expect(layer.hasOnClick).toBeTruthy();
    });

    it('should have operations', function () {
        expect(layer.hasOperations).toBeTruthy();
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
});*/