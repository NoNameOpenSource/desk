import { DeskEvent, WorkSpace } from ".";
import { DIApplicationDelegate } from "../Desk";
import { DIAlertView } from "../Desk/DIAlertView";
import { DISimpleAlertView } from "../Desk/DISimpleAlertView";
import { DISmallAlertView } from "../Desk/DISmallAlertView";
import { DIView } from "../Desk/DIView";
import { DIWindow } from "../Desk/DIWindow";
import { DeskAnimation } from "./DeskAnimation";

/**
 * This class is for the Applications that will run on 'Desk System'
 *
 * Application gets loaded from Secretary Class
 */
export class Application {
    workSpace: WorkSpace;
    data: any;
    window: DIWindow;
    alerts: DIAlertView[];
    alertScreen: DIView;
    loadingScreen: DIView;
    loadingAnimation: DIView;
    animations: DeskAnimation[];
    resizable: boolean;
    AppDelegate: DIApplicationDelegate;
    minWidth: any;
    /** @todo spelling */
    deleted: boolean;
    allowDrag: boolean;
    dragStart: (arg0: any) => void;
    dragOn: (x: number, y: number) => void;
    dragEnd: (arg0: boolean, arg1?: any, x?: number, y?: number) => void;

    private _loading: boolean;

    /**
     *
     * @param appName Name of the Application
     *
     * @todo should resizable be a boolean?
     */
    constructor(workSpace: WorkSpace, appName: string, appSettings?: Record<string, unknown>, windowClass?: string, resizable?: number) {
        this.workSpace = workSpace;
        this.data = workSpace.data;
        this.window = new DIWindow(windowClass, undefined, appName, resizable);
        this.window.app = this;

        // Init alert layer
        this.alerts = [];
        this.alertScreen = new DIView("DILoading");
        this.alertScreen.body.style.zIndex = `${100}`;
        this.alertScreen.hidden = true;
        //this._loading = true;

        // Init loading layer
        this.loadingScreen = new DIView("DILoading");
        this.loadingAnimation = new DIView("loading");
        this.loadingAnimation.width = 112;
        this.loadingAnimation.height = 112;
        this.loadingAnimation.body.style.left = "calc(50% - 64px)";
        this.loadingAnimation.body.style.top = "calc(50% - 64px)";

        this.animations = [];

        if (resizable) {
            this.resizable = true;
        }
    }

    init() {
        this.AppDelegate.init(this);
    }

    didMoveToDesk() {
        // @ts-ignore TODO: remove this conditional block that unnecessarily checks for window being a DIView
        if (this.window.child.view) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.window.child.view.addChildView(this.alertScreen);
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.window.child.view.addChildView(this.loadingScreen);
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
        let alert: DIAlertView;
        if (this.window.width < 330) alert = new DISmallAlertView(text, undefined, className);
        else alert = new DIAlertView(text, undefined, className);
        this.alerts.push(alert);
        if (this.window.width > 500) {
            alert.body.style.left = "calc(50% - 230px)";
        }
        alert.events.push(
            new DeskEvent(window, "keydown", (evt: any) => {
                if (evt.keyCode === 13) {
                    // enter key
                    alert.buttons[alert.buttons.length - 1].buttonBody.click();
                } else if (evt.keyCode === 27) {
                    // esc
                    alert.buttons[0].buttonBody.click();
                }
            })
        );
        alert.addButton("Ok", () => {
            const i = this.alerts.indexOf(alert);
            this.alerts[i] = null;
            this.alerts.splice(i, 1);
            alert.delete();
            alert = null;
            if (this.alerts.length < 1) this.alertScreen.hidden = true;
            if (func) func();
        });
        this.window.child.addChildView(alert);
        alert.body.style.top = "calc(50% - ".concat(`${alert.height / 2}`, "px)");
        return alert;
    }

    alertSimple(text: string, frstTitle: string, scndTitle: string, frstFunc: () => void, scndFunc: () => void, className?: string) {
        this.alertScreen.hidden = false;
        let alert: DISimpleAlertView;
        if (this.window.width < 330) {
            alert = new DISimpleAlertView(text, undefined, className);
            this.alerts.push(alert);
            alert.events.push(
                new DeskEvent(window, "keydown", (evt: any) => {
                    if (evt.keyCode === 13) {
                        // enter key
                        alert.buttons[alert.buttons.length - 1].buttonBody.click();
                    } else if (evt.keyCode === 27) {
                        // esc
                        alert.buttons[0].buttonBody.click();
                    }
                })
            );
            alert.addButton(frstTitle, () => {
                const i = this.alerts.indexOf(alert);
                this.alerts[i] = null;
                this.alerts.splice(i, 1);
                alert.delete();
                alert = null;
                if (this.alerts.length < 1) this.alertScreen.hidden = true;
                if (frstFunc) frstFunc();
            });
            alert.addButton(scndTitle, () => {
                const i = this.alerts.indexOf(alert);
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
        let alert = new DIAlertView(titleText, undefined, className);
        if (errorMsg) alert.useTextArea(errorMsg);
        this.alerts.push(alert);
        alert.events.push(
            new DeskEvent(this.window.child.body, "keydown", (evt: any) => {
                if (evt.keyCode === 13) {
                    // enter key
                    alert.buttons[alert.buttons.length - 1].buttonBody.click();
                } else if (evt.keyCode === 27) {
                    // esc
                    alert.buttons[0].buttonBody.click();
                }
            })
        );
        alert.addButton("Ok", () => {
            const i = this.alerts.indexOf(alert);
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

    // eslint-disable-next-line class-methods-use-this
    resizeStart() {}

    // eslint-disable-next-line class-methods-use-this
    resizeEnd() {}

    resizeWidth(width: number) {
        if (width < this.minWidth) width = this.minWidth;
        if (width === this.window.width) return <boolean>false;
        this.window.width = width;
        return width;
    }

    // eslint-disable-next-line class-methods-use-this
    activate() {}

    // eslint-disable-next-line class-methods-use-this
    deactivate() {}

    // eslint-disable-next-line class-methods-use-this
    windowMinimized() {}

    // eslint-disable-next-line class-methods-use-this
    windowMaximized() {}

    // eslint-disable-next-line class-methods-use-this
    backButtonTriggered() {}

    beginAnimation(animation: DeskAnimation) {
        this.animations.push(animation);
    }

    // stopping animations is possible through the DeskAnimation. Not needed here. ...probably

    endAnimation(animation: DeskAnimation) {
        const i = this.animations.indexOf(animation);
        animation.delete();
        this.animations[i] = null;
        this.animations.splice(i, 1);
    }

    windowWillClose(window: any) {
        if (window === this.window) {
            // main window
        }
    }

    windowDidClose(window: any) {
        if (window === this.window) {
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
            let i = 0;
            for (; i < this.alerts.length; i++) {
                this.alerts[i].delete();
            }
        }
        this.workSpace.appDidClose(this);
        this.workSpace = null;
    }
}
