import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Timer;
import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class PowerMonitorView extends WatchUi.View {
    
    var mycount = 0;

    function initialize() {
        View.initialize();
    }
    function timerCallback() as Void {
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

    // Load your resources here
    function onLayout(dc as Dc) as Void {
        setLayout(Rez.Layouts.MainLayout(dc));
    }

    // Called when this View is brought to the foreground. Restore
    // the state of this View and prepare it to be shown. This includes
    // loading resources into memory.
    function onShow() as Void {
        var timer = new Timer.Timer();
        timerCallback();
        timer.start(method(:timerCallback), 20000, true);
        
    }

    // Update the view
    function onUpdate(dc as Dc) as Void {
        // Call the parent onUpdate function to redraw the layout
        View.onUpdate(dc);
    }

    // Called when this View is removed from the screen. Save the
    // state of this View here. This includes freeing resources from
    // memory.
    function onHide() as Void {
    }

}
