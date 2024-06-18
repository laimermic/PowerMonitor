import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class PowerMonitorApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
        System.println("PowerMonitorApp.initialize()");
    }

    // onStart() is called on application start up
    function onStart(state as Dictionary?) as Void {
    }

    // onStop() is called when your application is exiting
    function onStop(state as Dictionary?) as Void {
    }

    // Return the initial view of your application here
    function getInitialView() as [Views] or [Views, InputDelegates] {
        var view = new PowerMonitorView();
        return [ view, new PowerMonitorDelegate(view) ];
    }

}

function getApp() as PowerMonitorApp {
    return Application.getApp() as PowerMonitorApp;
}