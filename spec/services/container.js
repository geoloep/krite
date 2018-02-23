describe('ContainerService', function() {
    var s = new krite.Services.ContainerService('#wide', '#narrow');
    var app;

    xit('should allow registering an app', function() {
        app = new krite.Apps.HelloWorldApp(s);

        expect(s.app).toBe(app);
    });

    xit('should react to state changes');

    xit('should allow deregistering apps', function() {
        s.deregister();

        expect(s.app).toBeUndefined();
    })
});
