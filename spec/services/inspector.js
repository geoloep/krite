describe('InspectorService', function () {
    var s = new krite.Services.InspectorService();
    
    var testLayer = {
        name: 'justatest',
    };

    it('should save the inspected layer', function() {
        s.layer = testLayer;

        expect(s.name).toBe(testLayer.name);
    });
});