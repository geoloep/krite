describe('SourceService', function() {
    var s = new krite.Services.SourceService();

    var fakeSource = {
        name: 'justatest',
    };

    var promisedSource = {
        name: 'justapromisedsource',
    };

    it('should exist', function() {
        expect(s).toBeDefined();
    });

    it('should be possible to add an source', function() {
        expect(s.add('Fake Source', fakeSource)).toBe(fakeSource);
        expect(s.list.length).toBe(1);
    });

    it('should tell if it has an source', function() {
        expect(s.has('Fake Source')).toBeTruthy();
    });

    it('should be possible to get an source', function() {
        expect(s.get('Fake Source')).toBe(fakeSource);
    });

    it('should be possible to try an source', function() {
        expect(s.get('Does not exist')).toBeUndefined();
        expect(s.try('Fake Source')).toBeTruthy();
    });

    it('should deliver promised sources', function(done) {
        s.promise('Promised Source').then(function(source) {
            expect(source).toBe(promisedSource);
            done();
        });

        s.add('Promised Source', promisedSource);
    });
});
