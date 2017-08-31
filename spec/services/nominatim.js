describe('NominatimService', function() {
    var s = new krite.Services.NominatimService();

    it('should perform a search on the nominatim service', function(done) {
        s.search('groningen').then(function(results) {
            expect(results).toBeDefined();
            done();
        });
    });
});