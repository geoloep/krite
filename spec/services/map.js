describe('MapService', function () {
    // inject the HTML fixture for the test
    var fixture = '<div id="map" style="width: 500px; height: 500px;"></div>';

    document.body.insertAdjacentHTML(
        'afterbegin',
        fixture);

    // setup required objects
    krite.ServicePool.addService('ProjectService', new krite.Services.ProjectService(L.Projection.RD.proj4def));

    var mapService = new krite.Services.MapService('map', {
        center: [52.156, 5.389],
        zoom: 3,
        zoomAnimation: false,
        crs: L.CRS.RD,
    });

    var geoJson = {
        "type": "Polygon",
        "coordinates": [
            [[131534.0, 452820.0], [131567.0, 459774.0], [140807.0, 459739.0], [140787.0, 452785.0], [131534.0, 452820.0]]
        ]
    };
    var geoJsonLayer;

    var source = new krite.Sources.GeoServerSource('http://service.geoloep.nl/geoserver/gemeenten/ows');
    var layername = 'gemeentehuizen';
    var layer;

    it('should create leaflet map', function () {
        expect(mapService.map).toBeDefined();
    });

    it('should be possible to add an layer', function (done) {
        source.getLayer(layername).then(function (l) {
            layer = l;

            mapService.addLayer(layer);

            expect(mapService.layers.length).toBe(1);
            done();
        });
    });

    it('shoud be possible to check if a layer has been added', function () {
        expect(mapService.hasLayerByName(layername)).toBeTruthy();
    });

    it('should hide layers', function () {
        mapService.hideLayer(layer);

        expect(mapService.map.hasLayer(layer.leaflet)).toBeFalsy();

        // But not remove them all togheter!
        expect(mapService.hasLayerByName(layername)).toBeTruthy();
    });

    it('should show layers', function () {
        mapService.showLayer(layer);

        expect(mapService.map.hasLayer(layer.leaflet)).toBeTruthy();
    });

    it('should remove layers', function () {
        mapService.removeLayer(layer);

        expect(mapService.map.hasLayer(layer.leaflet)).toBeFalsy();
        expect(mapService.map.hasLayer(layer.leaflet)).toBeFalsy();

        mapService.addLayer(layer);
    });

    xit('should pass click events');

    it('should be able to determine zoom visibility', function () {
        layer.maxZoom = 6;
        layer.minZoom = 4;

        expect(mapService.visibleOnZoom(layer, 7)).toBeFalsy();
        expect(mapService.visibleOnZoom(layer, 3)).toBeFalsy();
        expect(mapService.visibleOnZoom(layer, 6)).toBeTruthy();
        expect(mapService.visibleOnZoom(layer, 5)).toBeTruthy();
    });

    it('should not show layer beyond maxZoom', function () {
        mapService.map.setZoom(8);
        expect(mapService.map.hasLayer(layer.leaflet)).toBeFalsy();
    });

    it('should show layer between min- and maxZoom', function () {
        mapService.map.setZoom(5);
        expect(mapService.map.hasLayer(layer.leaflet)).toBeTruthy();
    });

    it('should not show layer before minZoom', function () {
        mapService.map.setZoom(2);
        expect(mapService.map.hasLayer(layer.leaflet)).toBeFalsy();
    });

    it('should should show a highlight', function() {
        mapService.addHighlight(geoJson);

        expect(mapService.highlight).toBeDefined();

        geoJsonLayer = mapService.highlight;

        expect(mapService.map.hasLayer(geoJsonLayer)).toBeTruthy();
    });

    it('should should hide the highlight', function() {
        mapService.hideHighlight();

        expect(mapService.map.hasLayer(geoJsonLayer)).toBeFalsy();
    });

    it('should should show the highlight again', function() {
        mapService.showHighlight();

        expect(mapService.map.hasLayer(geoJsonLayer)).toBeTruthy();
    });

    it('should should add a focus', function () {
        mapService.addFocus();

        expect(mapService.focus).toBeDefined();

        var focus = mapService.focus;

        expect(mapService.map.hasLayer(focus)).toBeTruthy();
    });

    xit('should be able to set a basemap');
    
    xit('should be able to fit bounds');

    it('should be able to zoom to a point', function () {
        mapService.zoomToPoint(L.point(142892.19, 470783.87), 5);

        expect(mapService.map.getCenter().lat).toBeCloseTo(52.225);
        expect(mapService.map.getCenter().lng).toBeCloseTo(5.21);
    });

    it('should be able to zoom to a latlng', function () {
        mapService.zoomToLatLng(L.latLng([53.222, 6.597]));

        expect(mapService.map.getCenter().lat).toBeCloseTo(53.222);
        expect(mapService.map.getCenter().lng).toBeCloseTo(6.597);
    });
});
