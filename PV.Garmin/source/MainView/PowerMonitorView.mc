import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Timer;
import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class PowerMonitorView extends WatchUi.View {
    
    var timer = new Timer.Timer();

    function initialize() {
        View.initialize();
    }
    function timerCallback() as Void {
        var options = {                                             // set the options
            :method => Communications.HTTP_REQUEST_METHOD_GET,      // set HTTP method
        };
        var params = {                          
        };
        Communications.makeJsonRequest("https://api.pv.terrex.at/api/now", params, options, method(:onReceive));
    }



    function onReceive(responseCode as Number, data as Dictionary?) as Void {
        if (responseCode == 200) {
            System.println("Main View Request Successful"); 
            var production = data["production"]["value"];
            var usage = data["usage"]["value"];
            var feed = data["delivery"]["value"];
            var consumption = data["consumption"]["value"];
            var prodText = self.findDrawableById("production") as Text;
            prodText.setText("Production: " + production.toString() + " W");
            
            var usageText = self.findDrawableById("usage") as Text;
            usageText.setText("Usage: " + usage.toString() + " W");

            var feedConsText = self.findDrawableById("feedcons") as Text;
            if (production > usage) {
                feedConsText.setText("Feed: " + feed.toString() + " W");
                //feedConsText.setColor("#26b100")
            } else {
                feedConsText.setText("Consumption: " + consumption.toString() + " W");
                //feedConsText.setColor("#8900f8")
            }

            WatchUi.requestUpdate();
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
        timerCallback();
        timer.start(method(:timerCallback), 5000, true);
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
        timer.stop();
    }

}
