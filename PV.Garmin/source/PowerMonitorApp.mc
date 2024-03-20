import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class PowerMonitorApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
        System.println("PowerMonitorApp.fdsfsd()");
        var options = {                                             // set the options
            :method => Communications.HTTP_REQUEST_METHOD_GET,      // set HTTP method
        };
        var params = {                          
        };
        Communications.makeJsonRequest("https://pv.terrex.at/PV/current", params, options, method(:onReceive));
    }

    function onReceive(responseCode as Number, data as Dictionary?) as Void {
        if (responseCode == 200) {
            System.println("Request Successful"); 
            System.println(data["production"]["value"]);                  // print success
        } else {
            System.println("Response: " + responseCode);            // print response code
            System.println(data);                                   // print response data
        }
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