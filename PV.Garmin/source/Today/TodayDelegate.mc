import Toybox.WatchUi;
class TodayDelegate extends WatchUi.InputDelegate {
    var view;
    function initialize(_view) {
        InputDelegate.initialize();
        System.println("TodayDelegate.initialize()");
        view = _view;
    }

    function onTap(evt) {
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
        return true;
    }
}