describe('SidebarServiceApp', function() {
    var sidebarApp = new krite.Services.SidebarServiceApp('TestApp', 'Test Application', 'done');
    var app;

    it('should construct', function() {
        expect(sidebarApp).toBeDefined();
    });

    it('should register apps', function() {
        app = new krite.Apps.HelloWorldApp(sidebarApp);

        expect(sidebarApp.app).toBe(app);
    });

    it('should deregister apps', function() {
        sidebarApp.deregister();

        expect(sidebarApp.app).toBeUndefined();
    });

});

describe('SidebarService', function() {
    // inject the HTML fixture for the test
    var fixture = '<div id="sidebartest"></div>';

    document.body.insertAdjacentHTML(
        'afterbegin',
        fixture
    );

    var sidebarApp1 = new krite.Services.SidebarServiceApp('TestApp1', 'Test Application 1', 'done');
    var sidebarApp2 = new krite.Services.SidebarServiceApp('TestApp2', 'Test Application 2', 'done');

    var app1 = new krite.Apps.HelloWorldApp(sidebarApp1, 'First TestApp');
    var app2 = new krite.Apps.HelloWorldApp(sidebarApp2, 'Second TestApp');

    var sidebar = new krite.Services.SidebarService('sidebartest');


    it('should be possible to add apps', function() {
        expect(sidebar.addApp(sidebarApp1)).toBe(sidebarApp1);
        expect(sidebar.addApp(sidebarApp2)).toBe(sidebarApp2);

        expect(sidebar.apps.TestApp1).toBeDefined();
        expect(sidebar.apps.TestApp2).toBeDefined();

        expect(Object.keys(sidebar.apps).length).toBe(2);
    });

    it('should be possible to set an app', function() {
        sidebar.setApp('TestApp1');

        expect(sidebar.activeName).toBe('TestApp1');
        expect(sidebar.activeApp).toBe(sidebarApp1);

        // maybe check if app was inserted
    });

    it('should be possible to clear the sidebar', function() {
        sidebar.clear();

        expect(sidebar.activeName).toBeUndefined();
        expect(sidebar.activeApp).toBeUndefined();
    });

    it('should callback on change', function(done) {
        sidebar.registerOnChange(function() {
            expect(sidebar.activeName).toBe('TestApp2');
            expect(sidebar.activeApp).toBe(sidebarApp2);
            done();
        });

        sidebar.setApp('TestApp2');
    });
});
