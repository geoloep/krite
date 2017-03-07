describe('ContainerService', function() {
    var s = new krite.Services.ContainerService('#wide', '#narrow');
    var app;

    it('should allow registering an app', function() {
        app = new krite.Apps.HelloWorldApp(s);

        expect(s.app).toBe(app);
    });

    xit('should react to state changes');

    it('should allow deregistering apps', function() {
        s.deregister();

        expect(s.app).toBeUndefined();
    })
});
