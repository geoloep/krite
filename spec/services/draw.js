describe('DrawService', function() {
    // inject the HTML fixture for the test
    var fixture = '<div id="map" style="width: 500px; height: 500px;"></div>';

    document.body.insertAdjacentHTML(
        'afterbegin',
        fixture);

    // setup required objects
    krite.ServicePool.addService('ProjectService', new krite.Services.ProjectService(L.CRS.RD, L.Projection.RD.proj4def));

    var mapService = krite.ServicePool.addService('MapService' , new krite.Services.MapService('map', {
        center: [52.156, 5.389],
        zoom: 3,
        zoomAnimation: false,
        crs: L.CRS.RD,
    }));

    var s = new krite.Services.DrawService();

    it('should exist and load dependencies', function() {
        expect(s).toBeDefined();

        expect(s.service).toBeDefined();
        expect(s.project).toBeDefined();
    });

    it('should draw rectangles', function() {
        expect(s.rectangle()).toBeDefined();
        expect(s.lock).toBeTruthy();
    });

    it('should release the lock on disable', function() {
        s.disable();
        expect(s.lock).toBeFalsy();
    });

    it('should draw polylines', function() {
        s.disable();
        expect(s.polyline()).toBeDefined();
        expect(s.lock).toBeTruthy();
    });

    it('should draw polygons', function() {
        s.disable();
        expect(s.polygon()).toBeDefined();
        expect(s.lock).toBeTruthy();
    });

    // clean up
    afterAll(function () {
        mapService.map.remove();
    })
});