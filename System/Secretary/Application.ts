import { DeskEvent, WorkSpace } from ".";
import { DIAlertView } from "../Desk/DIAlertView";
import { DISimpleAlertView } from "../Desk/DISimpleAlertView";
import { DISmallAlertView } from "../Desk/DISmallAlertView";
import { DIView } from "../Desk/DIView";
import { DIWindow } from "../Desk/DIWindow";

/**
 * This class is for the Applications that will run on 'Desk System'
 *
 * Application gets loaded from Secretary Class
 */
export class Application {
    workSpace: WorkSpace;
    data: any;
    window: any;
    alerts: any[];
    alertScreen: any;
    loadingScreen: any;
    loadingAnimation: any;
    animations: any[];
    resizable: boolean;
    AppDelegate: any;
    _loading: any;
    minWidth: any;
    /** @todo spelling */
    ainmations: any;
    deleted: boolean;

    /**
     *
     * @param appName Name of the Application
     *
     * @todo should resizable be a boolean?
     */
    constructor(workSpace: WorkSpace, appName: string, windowClass?: string, resizable?: number) {
        this.workSpace = workSpace;
        this.data = workSpace.data;
        this.window = new DIWindow(windowClass, undefined, appName, resizable);
        this.window.app = this;

        // Init alert layer
        this.alerts = new Array();
        this.alertScreen = new DIView("DILoading");
        this.alertScreen.body.style.zIndex = 100;
        this.alertScreen.hidden = true;
        //this._loading = true;

        // Init loading layer
        this.loadingScreen = new DIView("DILoading");
        this.loadingAnimation = new DIView("loading");
        this.loadingAnimation.width = 112;
        this.loadingAnimation.height = 112;
        this.loadingAnimation.body.style.left = "calc(50% - 64px)";
        this.loadingAnimation.body.style.top = "calc(50% - 64px)";

        this.animations = new Array();

        if (resizable) {
            this.resizable = true;
        }
    }

    init() {
        this.AppDelegate.init(this);
    }

    didMoveToDesk() {
        if (this.window.child.view) {
            this.window.child.view.addChildView(this.alertScreen);
            this.window.child.view.addChildView(this.loadingScreen);
            this.window.child.view.addChildView(this.loadingAnimation);
        } else {
            this.window.child.addChildView(this.alertScreen);
            this.window.child.addChildView(this.loadingScreen);
            this.window.child.addChildView(this.loadingAnimation);
        }
        if (this._loading === undefined) {
            this._loading = true;
            this.loading = false;
        }
    }

    alert(text: string, func: () => void, className: string) {
        this.alertScreen.hidden = false;
        var alert: any;
        if (this.window.width < 330) alert = new DISmallAlertView(text, undefined, className);
        else alert = new DIAlertView(text, false, className);
        this.alerts.push(alert);
        if (this.window.width > 500) {
            alert.body.style.left = "calc(50% - 230px)";
        }
        alert.events.push(
            new DeskEvent(window, "keydown", (evt: any) => {
                if (evt.keyCode == 13) {
                    // enter key
                    alert.buttons[alert.buttons.length - 1].buttonBody.click();
                } else if (evt.keyCode == 27) {
                    // esc
                    alert.buttons[0].buttonBody.click();
                }
            })
        );
        alert.addButton("Ok", () => {
            var i = this.alerts.indexOf(alert);
            this.alerts[i] = null;
            this.alerts.splice(i, 1);
            alert.delete();
            alert = null;
            if (this.alerts.length < 1) this.alertScreen.hidden = true;
            if (func) func();
        });
        if (this.window.child.view) this.window.child.view.addChildView(alert);
        else this.window.child.addChildView(alert);
        alert.body.style.top = "calc(50% - ".concat(`${alert.height / 2}`, "px)");
        return alert;
    }

    alertSimple(text: string, frstTitle: string, scndTitle: string, frstFunc: () => void, scndFunc: () => void, className?: string) {
        this.alertScreen.hidden = false;
        var alert: any;
        if (this.window.width < 330) {
            alert = new DISimpleAlertView(text, undefined, className);
            this.alerts.push(alert);
            alert.events.push(
                new DeskEvent(window, "keydown", (evt: any) => {
                    if (evt.keyCode == 13) {
                        // enter key
                        alert.buttons[alert.buttons.length - 1].buttonBody.click();
                    } else if (evt.keyCode == 27) {
                        // esc
                        alert.buttons[0].buttonBody.click();
                    }
                })
            );
            alert.addButton(frstTitle, () => {
                var i = this.alerts.indexOf(alert);
                this.alerts[i] = null;
                this.alerts.splice(i, 1);
                alert.delete();
                alert = null;
                if (this.alerts.length < 1) this.alertScreen.hidden = true;
                if (frstFunc) frstFunc();
            });
            alert.addButton(scndTitle, () => {
                var i = this.alerts.indexOf(alert);
                this.alerts[i] = null;
                this.alerts.splice(i, 1);
                alert.delete();
                alert = null;
                if (this.alerts.length < 1) this.alertScreen.hidden = true;
                if (scndFunc) scndFunc();
            });
            this.window.child.addChildView(alert);
            alert.body.style.top = "calc(50% - ".concat(`${alert.height / 2}`, "px)");
            return alert;
        }
    }

    alertError(titleText: string, errorMsg: string, func: () => void, className?: string) {
        this.alertScreen.hidden = false;
        var alert = new DIAlertView(titleText, false, className);
        if (errorMsg) alert.useTextArea(errorMsg);
        this.alerts.push(alert);
        alert.events.push(
            new DeskEvent(this.window.child.body, "keydown", (evt: any) => {
                if (evt.keyCode == 13) {
                    // enter key
                    alert.buttons[alert.buttons.length - 1].buttonBody.click();
                } else if (evt.keyCode == 27) {
                    // esc
                    alert.buttons[0].buttonBody.click();
                }
            })
        );
        alert.addButton("Ok", () => {
            var i = this.alerts.indexOf(alert);
            this.alerts[i] = null;
            this.alerts.splice(i, 1);
            alert.delete();
            alert = null;
            if (this.alerts.length < 1) this.alertScreen.hidden = true;
            if (func) func();
        });
        this.window.child.addChildView(alert);
        alert.body.style.top = "calc(50% - ".concat(`${alert.height / 2}`, "px)");
    }

    resizeStart() {}

    resizeEnd() {}

    resizeWidth(width: number) {
        if (width < this.minWidth) width = this.minWidth;
        if (width == this.window.width) return <boolean>false;
        this.window.width = width;
        return width;
    }

    activate() {}

    deactivate() {}

    beginAnimation(animation: any) {
        this.ainmations.push(animation);
    }

    // stopping animations is possible through the DeskAnimation. Not needed here. ...probably

    endAnimation(animation: any) {
        var i = this.animations.indexOf(animation);
        animation.delete();
        this.animations[i] = null;
        this.animations.splice(i, 1);
    }

    windowWillClose(window: any) {
        if (window == this.window) {
            // main window
        }
    }

    windowDidClose(window: any) {
        if (window == this.window) {
            // main window
            this.delete();
        }
    }

    get loading() {
        return this._loading;
    }

    set loading(value) {
        if (!this._loading && value) {
            this.loadingScreen.hidden = false;
            this.loadingAnimation.hidden = false;
            this._loading = true;
        } else if (this._loading && !value) {
            this.loadingScreen.hidden = true;
            this.loadingAnimation.hidden = true;
            this._loading = false;
        }
    }

    delete() {
        this.workSpace.appWillClose(this);
        this.deleted = true;
        if (!this.window.deleted) this.window.delete();
        if (this.alerts.length > 0) {
            var i = 0;
            for (; i < this.alerts.length; i++) {
                this.alerts[i].delete();
            }
        }
        this.workSpace.appDidClose(this);
        this.workSpace = null;
    }
}
