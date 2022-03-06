import { Desk } from "../Desk/Desk";
import { DIAlertView } from "../Desk/DIAlertView";
import { DIWindow } from "../Desk/DIWindow";

/**
 * This handles error on both system level, and application level under Secretary
 */
export class ErrorHandler {
    errWindows: any[];
    desk: Desk;

    constructor() {
        this.desk = Desk.getInstance();
        this.errWindows = new Array();
    }

    newAlert(content: string, innerHTML: HTMLElement = undefined) {
        var winId = this.errWindows.length;
        this.errWindows.push(new DIWindow());
        var tmp = new DIAlertView();
        if (!innerHTML) tmp.stringValue = content;
        else tmp.alertContent.textBody.innerHTML = content;
        this.errWindows[winId].setChildView(tmp);
        tmp.addButton("Ok", this.errWindows[winId].close.bind(this.errWindows[winId]));
        tmp.addButton("Report", this.errWindows[winId].close.bind(this.errWindows[winId]));
        this.errWindows[winId].parent = this;
        // @ts-ignore old Desk UI
        this.desk.addWindowAtCenter(this.errWindows[winId]);
    }

    closeWindow(window: any) {
        var i = this.errWindows.indexOf(window);
        this.desk.closeWindow(window);
        this.errWindows[i] = null;
        if (i != 1) {
            this.errWindows.splice(i, 1);
        }
    }
}
