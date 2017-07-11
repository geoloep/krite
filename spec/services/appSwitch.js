describe('SidebarService', function() {
    // inject the HTML fixture for the test
    var fixture = '<div id="sidebartest"></div>';

    document.body.insertAdjacentHTML(
        'afterbegin',
        fixture
    );

    var s = new krite.Services.AppSwitchService('sidebartest');

    var app1 = new krite.Apps.HelloWorldApp(s, 'First TestApp', 'First');
    var app2 = new krite.Apps.HelloWorldApp(s, 'Second TestApp', 'Second');


    it('should have added the apps', function() {
        var apps = s.getApps();

        expect('First' in apps).toBeTruthy();
        expect('Second' in apps).toBeTruthy();
        expect(Object.keys(apps).length).toBe(2);
    });

    it('should be possible to set an app', function() {
        s.setApp('First');

        expect(s.getActiveName()).toBe('First');
        expect(s.getActiveApp()).toBe(app1);
    });

    it('should be possible to clear', function() {
        s.clear();

        expect(s.getActiveName()).toBeUndefined();
        expect(s.getActiveApp()).toBeUndefined();
    });

    it('should callback on change', function(done) {
        s.registerOnChange(function() {
            expect(s.getActiveName()).toBe('Second');
            expect(s.getActiveApp()).toBe(app2);
            done();
        });

        s.setApp('Second');
    });
});
