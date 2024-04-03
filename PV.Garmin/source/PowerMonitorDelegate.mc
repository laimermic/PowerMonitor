import Toybox.WatchUi;
class PowerMonitorDelegate extends WatchUi.InputDelegate {
    var view;
    function initialize(_view) {
        InputDelegate.initialize();
        System.println("PowerMonitorDelegate.initialize()");
        view = _view;
    }

    function onTap(evt) {
        System.println("onKey");
        var text = view.findDrawableById("production") as Text;
        text.setText("text changed by delegate");
        WatchUi.pushView(view, delegate, transition)
        return true;
    }
}