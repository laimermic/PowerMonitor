import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Timer;
import Toybox.Application;
import Toybox.Lang;
import Toybox.WatchUi;

class TodayView extends WatchUi.View {
    
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
        var unixTime = new Time.Moment(Time.now().value());
        System.println(unixTime.toString());
        Communications.makeJsonRequest("https://api.pv.terrex.at/api/fullday/" + unixTime.toString(), params, options, method(:onReceive));
    }



    function onReceive(responseCode as Number, data as Dictionary?) as Void {
        if (responseCode == 200) {

            var produced = data["produced"];
            System.println("Today Request Successful");
            System.println(produced.toString()); 
            // var frequency = data["frequency"]["value"];
            
            // var freqText = self.findDrawableById("grid") as Text;
            // // var formatedFreq = ((frequency * 100).toNumber().toFloat()) / 100;
            // freqText.setText(frequency.format("%.2f") + " Hz");

            // if (frequency < 49.8 || frequency > 50.2) {
            //     freqText.setColor(Graphics.COLOR_RED);
            // } else {
            //     if (frequency < 49.85 || frequency > 50.15) {
            //         freqText.setColor(Graphics.COLOR_YELLOW);
            //     } else {
            //         freqText.setColor(Graphics.COLOR_GREEN);
            //     }
            // }

            WatchUi.requestUpdate();
        } else {
            System.println("Response: " + responseCode);            // print response code
            System.println(data);                                   // print response data
        }
    }

    // Load your resources here
    function onLayout(dc as Dc) as Void {
        setLayout(Rez.Layouts.PowerGridLayout(dc));
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
