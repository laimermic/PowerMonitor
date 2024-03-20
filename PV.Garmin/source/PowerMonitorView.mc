import Toybox.Graphics;
import Toybox.WatchUi;
import Toybox.Timer;

class PowerMonitorView extends WatchUi.View {
    
    var mycount = 0;

    function initialize() {
        View.initialize();
    }
    function timerCallback() as Void {
        var drw = View.findDrawableById("test") as Text;
        //System.println(drw.get);
        drw.setText("TestSuccess");
        System.println("Timer callback");
        mycount += 1;
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
        //timerCallback();
        timer.start(method(:timerCallback), 1000, true);
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
