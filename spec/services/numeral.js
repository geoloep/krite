describe('NumeralService', function() {
    var s = new krite.Services.NumeralService('en');

    xit('should be possible to set an locale');

    xit('should parse numbers');

    it('shoud format floating point numbers', function() {
        expect(s.float(10000.1234)).toBe('10,000.12');
    });

    it('should format integer numbers', function() {
        expect(s.int(12.345)).toBe('12');
    });

    it('should format percetages', function() {
        expect(s.percentage(75)).toBe('75%');
    });

});
