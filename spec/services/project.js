describe('ProjectService', function() {
    var s = new krite.Services.ProjectService(L.CRS.RD, '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs');

    var gj = {
        linestring: {
            rd: {
                type: 'LineString',
                coordinates: [[142000, 470000], [142100, 470100]],
            },
            wgs: {
                type: 'LineString',
                coordinates: [[5.1969725, 52.2179345], [5.198432, 52.2188356]],
            }
        }
    }

    it('shoud project to latlng', function() {
        var r = s.geoTo(gj.linestring.rd);

        for (var i = 0; i < 2; i++) {
            expect(r.coordinates[i][0]).toBeCloseTo(gj.linestring.wgs.coordinates[i][0]);
            expect(r.coordinates[i][1]).toBeCloseTo(gj.linestring.wgs.coordinates[i][1]);
        }
    });

    it('shoud project from latlng', function() {
        var r = s.geoFrom(gj.linestring.wgs);

        for (var i = 0; i < 2; i++) {
            expect(r.coordinates[i][0]).toBeCloseTo(gj.linestring.rd.coordinates[i][0]);
            expect(r.coordinates[i][1]).toBeCloseTo(gj.linestring.rd.coordinates[i][1]);
        }
    });
});