import Toybox.WatchUi;
class PowerGridDelegate extends WatchUi.InputDelegate {
    var view;
    function initialize(_view) {
        InputDelegate.initialize();
        System.println("PowerGridDelegate.initialize()");
        view = _view;
    }

    function onTap(evt) {
        var mainView = new PowerMonitorView();
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
        return true;
    }
}