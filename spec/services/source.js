describe('SourceService', function() {
    var s = new krite.Services.SourceService();

    var fakeSource = {
        name: 'justatest',
    };

    it('should exist', function() {
        expect(s).toBeDefined();
    });

    it('should be possible to add an source', function() {
        expect(s.add('Fake Source', fakeSource)).toBe(fakeSource);
        expect(s.sourceList.length).toBe(1);
        expect(s.sources['Fake Source']).toBe(fakeSource);
    });
});
