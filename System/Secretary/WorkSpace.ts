import { Desk } from "../Desk/Desk";
import { DIImageView } from "../Desk/DIImageView";
import { DIView } from "../Desk/DIView";
import { Application } from "./Application";
import { DeskEvent } from "./DeskEvent";
import { secretaryInstance } from "./Singleton";

/**
 * This is a simple way to display an image
 */
export class WorkSpace {
    name: string;
    icon: DIImageView;
    appSettings: any;
    appList: string[];
    apps: Application[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: Object;
    body: DIView;
    loaded: boolean;
    width: number;
    loadedMark: HTMLElement;
    contextMenu: any;
    lastWidth: any;
    resizeEvent: DeskEvent;
    resizeEnd: DeskEvent;
    desk: Desk;

    constructor(spaceName: string, iconName: string, appList: string[], appSettings?: any[]) {
        this.desk = Desk.getInstance();
        this.name = spaceName;
        this.icon = new DIImageView(iconName, "WorkSpaceIcon");
        this.appSettings = new DIImageView(iconName, "WorkSpaceIcon");
        this.appList = appList;
        this.apps = [];
        this.data = new Object();
        this.body = new DIView("WorkSpace");
        this.loaded = false;
        this.appSettings = appSettings;
        this.width = 10;
        this.body.width = this.width;
    }

    initApps() {
        let i = 0;
        for (; i < this.appList.length; i++) {}
    }

    wakeUp() {
        if (!this.loaded) {
            this.loadApps();
            this.loaded = true;
            this.loadedMark = document.createElement("DIView");
            this.loadedMark.className = "WorkSpaceIconMark";
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.icon.body.appendChild(this.loadedMark);
        } else {
            let i = 0;
            for (; i < this.apps.length; i++) {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.apps[i].wakeUp();
            }
        }
    }

    putInSleep() {
        let i = 0;
        for (; i < this.apps.length; i++) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.apps[i].putInSleep();
        }
    }

    loadApps() {
        let i = 0;
        for (; i < this.appList.length; i++) {
            this.loadApp(this.appList[i], this.appSettings[i]);
        }
    }

    loadApp(name: string, setting: any) {
        const loadedApp = secretaryInstance.loadApp(name, setting, this);
        const i = this.apps.push(loadedApp) - 1;
        this.addWindow(this.apps[i].window);
        this.apps[i].data = this.data;
        this.apps[i].workSpace = this;
        if (this.apps[i].didMoveToDesk) this.apps[i].didMoveToDesk();
        this.apps[i].window.didMoveToDesk();
        if (this.apps[i].resizable) {
            const app = this.apps[i];
            // @ts-ignore
            app.rightBorder = new DIView();
            // @ts-ignore
            app.rightBorder.body.style.height = "100%";
            // @ts-ignore
            app.rightBorder.body.style.width = "10px";
            // @ts-ignore
            app.rightBorder.x = app.window.x + app.window.width;
            // @ts-ignore
            app.rightBorder.body.style.cursor = "ew-resize";
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.body.addChildView(this.apps[i].rightBorder);
            // @ts-ignore
            app.rightBorder.body.app = app;
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            app.rightBorder.events.push(
                new DeskEvent(
                    // @ts-ignore
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    app.rightBorder.body,
                    "mousedown",
                    (evt: Event) => {
                        // @ts-ignore TODO: bug
                        if (evt.button === 0) {
                            evt.preventDefault();
                            // @ts-ignore TODO: bug
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            this.resizeWindow(evt.target.app, evt);
                        }
                    }
                )
            );
        }
    }

    /**
     * @todo finish function or remove it
     */
    setContextMenu(_dataSource: any, _delegate: any) {
        if (this.contextMenu) {
        }
    }

    fullScreen(window: any) {
        window.x = 0;
        window.titleBar.hidden = true;
        window.width = this.body.body.getBoundingClientRect().width;
    }

    addWindow(window: any) {
        window.y = 0;
        window.x = this.width;
        this.width += window.width + 10; // 1 is for the border
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.body.addChildView(window);
        this.body.width = this.width;
    }

    resizeWindow(app: Application, evt: DeskEvent) {
        if (app.window.minButton.hidden) {
            // window is minimized
            return;
        }
        const index = this.apps.indexOf(app) + 1;
        // @ts-ignore TODO: bug
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const diff = app.rightBorder.body.getBoundingClientRect().left - evt.clientX;
        this.lastWidth = app.window.width;
        let i = index;
        for (; i < this.apps.length; i++) {
            this.apps[i].window.body.style.transition = "none";
        }
        app.resizeStart();

        this.resizeEvent = new DeskEvent(document, "mousemove", (evt: DeskEvent) => {
            // @ts-ignore TODO: bug
            const width = app.resizeWidth(this.desk.body.body.scrollLeft + evt.clientX - this.desk.body.x - app.window.x + diff);
            if (width !== false) {
                // @ts-ignore
                const change = this.lastWidth - width;
                let i = index;
                for (; i < this.apps.length; i++) {
                    this.apps[i].window.x -= change;
                    if (this.apps[i].resizable) {
                        // @ts-ignore
                        this.apps[i].rightBorder.x -= change;
                    }
                }
                this.width += change;
                this.body.width += change;
                this.lastWidth = width;
            }
        });

        this.resizeEnd = new DeskEvent(window, "mouseup", (evt: DeskEvent) => {
            // @ts-ignore
            this.resizeEvent.listener(evt);
            this.resizeEvent.delete();
            app.resizeEnd();
            // @ts-ignore
            app.rightBorder.x = app.window.x + app.window.width;
            let i = index;
            for (; i < this.apps.length; i++) {
                this.apps[i].window.body.style.transition = "";
            }
            this.resizeEnd.delete();
            this.resizeEvent = null;
            this.resizeEnd = null;
        });
    }

    dataUpdated(str: string, data: any, sender: any) {
        if (str) {
            let i = 0;
            for (; i < this.apps.length; i++) {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (this.apps[i].dataUpdated) this.apps[i].dataUpdated(str, data, sender);
            }
        } else {
            let i = 0;
            for (; i < this.apps.length; i++) {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (this.apps[i].dataUpdated) this.apps[i].dataUpdated();
            }
        }
    }

    updateWindows() {
        let currentLen = 10;
        let i = 0;
        for (; i < this.apps.length; i++) {
            this.apps[i].window.x = currentLen;
            currentLen += this.apps[i].window.width + 10;
            if (this.apps[i].resizable) {
                // @ts-ignore
                this.apps[i].rightBorder.x = currentLen - 10;
            }
        }
        this.body.width = currentLen;
        this.width = currentLen;
    }

    /**
     * @todo finish function or remove it
     */
    appWillClose(_app: Application) {
        throw new Error("Method not implemented.");
    }

    appDidClose(app: Application) {
        // check if the application have right boarder
        // @ts-ignore
        if (app.rightBorder) {
            // @ts-ignore
            app.rightBorder.body.app = null;
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            app.rightBorder.delete();
        }
        const index = this.apps.indexOf(app);
        if (index !== -1) {
            this.apps[index] = null;
            this.apps.splice(index, 1);
            this.body.children.splice(index, 1);
        }
        this.updateWindows();
    }

    delete() {
        let i = 0;
        for (; i < this.apps.length; i++) {
            this.apps[i].delete();
        }
        this.apps.length = 0;
        this.body.children.length = 0;
        this.body.delete();
        this.icon.delete();
    }
}
