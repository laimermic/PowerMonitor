import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class PowerMonitorApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
        System.println("PowerMonitorApp.fdsfsd()");
        
    }

    // onStart() is called on application start up
    function onStart(state as Dictionary?) as Void {
    }

    // onStop() is called when your application is exiting
    function onStop(state as Dictionary?) as Void {
    }

    // Return the initial view of your application here
    function getInitialView() as Array<Views or InputDelegates>? {
        return [ new PowerMonitorView() ] as Array<Views or InputDelegates>;
    }

}

function getApp() as PowerMonitorApp {
    return Application.getApp() as PowerMonitorApp;
}