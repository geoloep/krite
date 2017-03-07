describe('ServiceManager', function() {
    var s = krite.ServicePool;

    it('should be available as an instance', function() {
        expect(s).toBeDefined();
    });

    it('should allow you to add services', function() {
        s.addService('Testservice', 'justastring');

        expect(s.hasService('Testservice')).toBeTruthy();
    });

    it('should give services', function() {
        expect(s.getService('Testservice')).toBe('justastring');
    });

    it('should try giving services', function() {
        expect(s.tryService('Testservice')).toBe('justastring');
        expect(s.tryService('NoService')).toBeFalsy();
    });

    it('should promise giving existing services', function(done) {
        s.promiseService('Testservice').then(function(service) {
            expect(service).toBe('justastring');
            done();
        });
    });

    it('should promise giving not yet existing services', function(done) {
        s.promiseService('PromisedService').then(function(service) {
            expect(service).toBe('keptmypromise');
            done();
        });

        s.addService('PromisedService', 'keptmypromise');
    });
});
