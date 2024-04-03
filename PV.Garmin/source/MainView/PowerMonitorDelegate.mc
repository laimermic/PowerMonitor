import Toybox.WatchUi;
class PowerMonitorDelegate extends WatchUi.InputDelegate {
    var view;
    function initialize(_view) {
        InputDelegate.initialize();
        System.println("PowerMonitorDelegate.initialize()");
        view = _view;
    }

    function onTap(evt) {
        var gridView = new PowerGridView();
        WatchUi.pushView(gridView, new PowerGridDelegate(gridView), WatchUi.SLIDE_LEFT);
        return true;
    }
}