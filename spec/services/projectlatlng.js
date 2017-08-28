describe('ProjectLatLngService', function() {
    var s = new krite.Services.ProjectLatLngService();

    var gj = {
        linestring: {
            wgs: {
                type: 'LineString',
                coordinates: [[5.1969725, 52.2179345], [5.198432, 52.2188356]],
            }
        }
    }

    it('shoud not project to', function() {
        var r = s.geoTo(gj.linestring.wgs);

        expect(r).toBe(gj.linestring.wgs);
    });

    it('shoud project from', function() {
        var r = s.geoFrom(gj.linestring.wgs);

        expect(r).toBe(gj.linestring.wgs);
    });
});