import { Application } from "../Secretary";
import { DeskEvent } from "../Secretary/DeskEvent";
import { secretaryInstance } from "../Secretary/Singleton";
import { DeskMenu } from "./DeskMenu";
import { DIAlertView } from "./DIAlertView";
import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
import { DIListView } from "./DIListView";
import { DIListViewCell } from "./DIListViewCell";
import { DIResizableWindow } from "./DIResizableWindow";
import { DIView } from "./DIView";
import { DIWindow } from "./DIWindow";
import { DIWorkSpaceDock } from "./DIWorkSpaceDock";
import * as DeskSingleton from "./Singleton";

/**
 * 생성자
 *
 * Singleton.
 *
 * @property -dataBaseType	: 데이터베이스로 사용될 프로그램의 종류
 * @property -MySQL	: 1
 */
export class Desk {
    useHeader = true;
    useNav = false;
    useFooter = false;
    useMultiWindows = false;

    headerHeight = 28;
    headerHide = false;

    header: DIView;
    body: DIView;
    headerLogo: DIImageView;
    topMenu: DIView;

    windows: DIWindow[];
    windowsIndex = 11;
    currentWindow: DIResizableWindow;

    cursor: string[];

    screenHeight: number;
    screenWidth: number;

    alerts: DIAlertView[];
    alertScreen: DIView;
    wallpaper: DIImageView;
    workSpaceDock: DIWorkSpaceDock;

    contextMenu: DIListView;

    contextList: string[];

    canvas: HTMLElement;

    deskMenu: DeskMenu;

    contextEvent: DeskEvent;

    dragEnded: boolean;
    lastDragApp: Application;
    currentDragApp: Application;
    dragEvent: DeskEvent;
    dropEvent: DeskEvent;
    dropEsc: DeskEvent;

    public static getInstance() {
        if (!DeskSingleton.deskInstance) {
            DeskSingleton.set(new Desk());
        }

        return DeskSingleton.deskInstance;
    }

    private constructor() {
        console.debug("Instantiating Desk");

        // Draw wallpaper
        this.wallpaper = new DIImageView("/System/Desk/Resources/Wallpaper/Blured/default.png", "DIWallpaper");
        document.body.appendChild(this.wallpaper.body);

        //make views for each section
        this.header = new DIView(undefined, "header");
        document.body.appendChild(this.header.body);
        // Init WorkSpace Dock
        this.workSpaceDock = new DIWorkSpaceDock("WorkSpaceDock");
        document.body.appendChild(this.workSpaceDock.body);
        this.workSpaceDock.didMoveToDesk();
        this.body = new DIView(undefined, "body");
        document.body.appendChild(this.body.body);
        this.body.x = 64;
        this.body.y = 28;

        //draw logo
        this.headerLogo = new DIImageView("/System/Desk/Resources/EDUspaceLogoWhite.svg", undefined, "headerLogo");
        this.header.addChildView(this.headerLogo);
        // @ts-ignore TODO: bug
        this.loadLogoAsInline();

        // Draw top menu
        this.initTopMenu();

        this.screenHeight = document.documentElement.clientHeight;
        this.screenWidth = document.documentElement.clientWidth;

        this.cursor = ["auto", "default", "wait", "pointer", "text", "vertical-text", "copy", "not-allowed", "ns-resize", "ew-resize"];

        // Init contextMenu
        this.contextMenu = new DIListView(this, this, 1, "DIContextMenu");
        this.contextMenu.cellHeight = 25;
        this.contextList = [];

        // Init canvas
        this.canvas = document.createElement("CANVAS");
        document.body.appendChild(this.canvas);
        this.canvas.style.display = "none";

        // Init desk menu
        this.initDeskMenu();

        // Init alert screen
        this.alertScreen = new DIView("DILoading");
        document.body.appendChild(this.alertScreen.body);
        this.alertScreen.hidden = true;
    }

    hideTopMenuBar() {
        this.body.y = 0;
        this.workSpaceDock.y = 0;
        this.header.hidden = true;
    }

    hideWorkSpaceDock() {
        this.body.x = 0;
        this.workSpaceDock.hidden = true;
    }

    hideWallpaper() {
        this.wallpaper.hidden = true;
    }

    initTopMenu() {
        this.topMenu = new DIView(undefined, "topMenu");
        this.header.addChildView(this.topMenu);
    }

    initDeskMenu() {
        this.deskMenu = new DeskMenu();
        this.deskMenu.width = 200;
        this.deskMenu.x = -1 * this.deskMenu.width;
        this.deskMenu.y = 28;

        this.headerLogo.events.push(new DeskEvent(this.headerLogo.body, "click", () => this.launchDeskMenu()));
        document.body.appendChild(this.deskMenu.body);
    }

    //	Context Menu
    showContextMenu(list: string[], delegate: any, x: number, y: number) {
        this.contextList = list;
        this.contextMenu.delegate = delegate;
        this.contextMenu.reloadData();
        this.contextMenu.x = x - this.body.x + this.body.body.scrollLeft;
        this.contextMenu.y = y - this.body.y;
        if (this.contextEvent) {
            this.contextEvent.delete();
            this.contextEvent = null;
        }
        this.contextEvent = new DeskEvent(document.body, "mousedown", (evt: MouseEvent) => {
            if (
                !(
                    this.contextMenu.body.getBoundingClientRect().left <= evt.clientX &&
                    evt.clientX <= this.contextMenu.body.getBoundingClientRect().right &&
                    this.contextMenu.body.getBoundingClientRect().top <= evt.clientY &&
                    evt.clientY <= this.contextMenu.body.getBoundingClientRect().bottom
                )
            ) {
                this.clearContextMenu();
            }
        });
        this.body.addChildView(this.contextMenu);
    }

    clearContextMenu() {
        if (this.contextEvent) {
            this.contextEvent.delete();
            this.contextEvent = null;
        }
        this.body.removeChildView(this.contextMenu);
    }

    numberOfRows(listView: DIListView) {
        if (listView === this.contextMenu) return this.contextList.length;
    }

    cellAtRow(listView: DIListView, row: number) {
        if (listView === this.contextMenu) {
            const cell = new DIListViewCell("DIContextMenuCell");
            // @ts-ignore TODO: bug
            cell.name = new DILabel(this.contextList[row]);
            // @ts-ignore TODO: bug
            cell.addChildView(cell.name);
            return cell;
        }
        return false;
    }

    setUpContextMenu(body: HTMLElement, delegate: any) {
        return new DeskEvent(body, "contextmenu", (evt: MouseEvent) => {
            evt.preventDefault();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const list = delegate.prepareContextMenu(body, evt.clientX, evt.clientY);
            if (list) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                this.showContextMenu(list, delegate, evt.clientX, evt.clientY);
            }
        });
    }

    // TODO: What is the clipboard type? - Bono
    startDrag(clipboard: any, view: DIView, x: number, y: number, originalX: number, originalY: number) {
        secretaryInstance.mainWorkSpace.apps.forEach((app) => app.allowDrag && app.dragStart(clipboard));

        this.dragEnded = false;

        document.body.appendChild(view.body);
        view.body.style.zIndex = "100000";

        const difX = originalX - x;
        const difY = originalY - y;
        view.x = x + difX;
        view.y = y + difY;

        this.lastDragApp = null;
        this.currentDragApp = null;

        this.dragEvent = new DeskEvent(
            document.body,
            "mousemove",
            (evt: MouseEvent) => {
                // find where the cursor is on
                if (evt.clientY < this.headerHeight) {
                    // client on header
                } else {
                    if (evt.clientX < this.body.x) {
                        // client on dock
                    } else {
                        let i = 0;
                        let app: Application;
                        for (; i < secretaryInstance.mainWorkSpace.apps.length; i++) {
                            app = secretaryInstance.mainWorkSpace.apps[i];
                            if (app.allowDrag) {
                                if (app.window.x + this.body.x < evt.clientX && app.window.x + app.window.width + this.body.x > evt.clientX) {
                                    app.dragOn(evt.clientX, evt.clientY);
                                }
                            }
                        }
                    }
                }
                view.x = evt.clientX + difX;
                view.y = evt.clientY + difY;
                if (this.currentDragApp !== this.lastDragApp) {
                    if (this.lastDragApp) this.lastDragApp.dragLeft();
                }
                this.lastDragApp = this.currentDragApp;
                this.currentDragApp = null;
            },
            false
        );

        this.dragEvent.target.addEventListener(this.dragEvent.method, this.dragEvent.evtFunc, true);

        this.dropEvent = new DeskEvent(
            document.body,
            "mouseup",
            (evt: MouseEvent) => {
                // find where the cursor is on
                // @ts-ignore TODO: bug
                if (evt.clientY < this.instance.headerHeight) {
                    // client on header
                } else {
                    if (evt.clientX < this.body.x) {
                        // client on dock
                    } else {
                        let i = 0;
                        let app;
                        for (; i < secretaryInstance.mainWorkSpace.apps.length; i++) {
                            app = secretaryInstance.mainWorkSpace.apps[i];
                            if (app.allowDrag) {
                                if (app.window.x + this.body.x < evt.clientX && app.window.x + app.window.width + this.body.x > evt.clientX) {
                                    app.dragEnd(true, clipboard, evt.clientX, evt.clientY);
                                } else {
                                    app.dragEnd(false);
                                }
                            }
                        }
                    }
                }

                // gap -m-

                if (!this.dragEnded) {
                    // non of the apps captured the drag
                    view.body.style.transition = "all .3s ease";
                    view.x = originalX;
                    view.y = originalY;
                    setTimeout(function () {
                        view.delete();
                        view = null;
                    }, 300);
                } else {
                    view.delete();
                    view = null;
                }
                this.lastDragApp = null;
                this.currentDragApp = null;

                this.dragEvent.target.removeEventListener(this.dragEvent.method, this.dragEvent.evtFunc, true);
                this.dragEvent.stopped = true;
                this.dragEvent.delete();
                this.dragEvent = null;
                this.dropEvent.target.removeEventListener(this.dropEvent.method, this.dropEvent.evtFunc, false);
                this.dropEvent.stopped = true;
                this.dropEvent.delete();
                this.dropEvent = null;

                this.dropEsc.delete();
                this.dropEsc = null;
            },
            false
        ); // use bubbling instead of capturing

        this.dropEvent.target.addEventListener(this.dropEvent.method, this.dropEvent.evtFunc, false);

        this.dropEsc = new DeskEvent(window, "keydown", (evt: any) => {
            if (evt.keyCode === 27) {
                // esc
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                if (this.currentDragApp !== null) this.currentDragApp.dragLeft();
                if (this.currentDragApp !== this.lastDragApp) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    if (this.lastDragApp) this.lastDragApp.dragLeft();
                }
                let i = 0;
                let app;
                for (; i < secretaryInstance.mainWorkSpace.apps.length; i++) {
                    app = secretaryInstance.mainWorkSpace.apps[i];
                    if (app.allowDrag) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        app.dragEnd(false);
                    }
                }
                // canceling drag
                view.body.style.transition = "all .3s ease";
                view.x = originalX;
                view.y = originalY;
                setTimeout(function () {
                    view.delete();
                    view = null;
                }, 300);
                this.lastDragApp = null;
                this.currentDragApp = null;
                this.dragEvent.target.removeEventListener(this.dragEvent.method, this.dragEvent.evtFunc, true);
                this.dragEvent.stopped = true;
                this.dragEvent.delete();
                this.dragEvent = null;
                this.dropEvent.target.removeEventListener(this.dropEvent.method, this.dropEvent.evtFunc, false);
                this.dropEvent.stopped = true;
                this.dropEvent.delete();
                this.dropEvent = null;

                this.dropEsc.delete();
                this.dropEsc = null;
            }
        });
    }

    static getIconOf(file: { type: string }) {
        if (file.type === "mp4") return "/System/Secretary/Icon/video.png";
        else return "/System/Secretary/Icon/file.png";
    }

    closeWindow(window: DIResizableWindow) {
        if (window === this.currentWindow) this.currentWindow = null;
        window.delete();
        window = null;
    }

    bringWindowFront(window: DIResizableWindow) {
        if (window.deleted) return false;
        if (window === this.currentWindow) return false;
        // TODO: do we mean "delete" instead of "deleted"?
        if (this.currentWindow && !this.currentWindow.deleted) this.currentWindow.putInSleep();
        window.z = this.windowsIndex;
        this.windowsIndex += 1;
        this.currentWindow = window;
        this.currentWindow.wakeUp();
    }

    static getFontHeight(font: string, size: number) {
        const span = document.createElement("SPAN");
        document.body.appendChild(span);
        span.textContent = "a";
        span.style.fontFamily = font;
        span.style.fontSize = `${size}px`;
        const height = span.offsetHeight;
        span.remove();
        return height;
    }

    static addPluginFrame(frame: HTMLElement) {
        frame.style.display = "none";
        document.body.appendChild(frame);
    }

    loadLogoAsInline() {
        // load logo as inline svg file
        const ajax = new XMLHttpRequest();
        ajax.open("GET", this.headerLogo.imageSource);
        ajax.addEventListener("load", (evt: ProgressEvent<XMLHttpRequestEventTarget>) => {
            this.headerLogo.imageBody.remove();
            this.headerLogo.imageBody = document.createElement("SVG");
            this.headerLogo.body.appendChild(this.headerLogo.imageBody);
            // @ts-ignore TODO
            this.headerLogo.imageBody.outerHTML = evt.target.responseText;
            // @ts-ignore TODO
            this.headerLogo.imageBody = this.headerLogo.body.children[0];
        });
        ajax.send();
    }

    alertError(titleText: string, errorMsg: string, func: () => void) {
        this.alertScreen.hidden = false;
        let alert = new DIAlertView(titleText, undefined, "DIAlertView");
        alert.useTextArea(errorMsg);
        this.alerts.push(alert);
        alert.events.push(
            // TODO: What is the body we want? body in Desk object attributes or body of HTML document - Bong-oh
            new DeskEvent(document.body, "keydown", (evt: KeyboardEvent) => {
                if (evt.key === "Enter") {
                    alert.buttons[alert.buttons.length - 1].buttonBody.click();
                } else if (evt.key === "Escape") {
                    alert.buttons[0].buttonBody.click();
                }
                // TODO: Do we want stopPropagation?
                evt.stopPropagation();
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
        document.body.appendChild(alert.body);
        alert.didMoveToDesk();
        alert.body.style.top = "calc(50% - ".concat(`${alert.height / 2}`, "px)");
        alert.body.style.left = "calc(50% - ".concat(`${alert.height / 2}`, "px)");
    }

    launchDeskMenu() {
        if (!this.deskMenu.active) {
            this.body.x += this.deskMenu.width;
            this.workSpaceDock.x += this.deskMenu.width;
            this.deskMenu.x += this.deskMenu.width;
            this.headerLogo.body.style.background = "#FFF";
            this.headerLogo.imageBody.style.fill = "#000";
            this.headerLogo.imageBody.style.stroke = "#000";
            this.deskMenu.active = true;
        } else {
            this.body.x -= this.deskMenu.width;
            this.workSpaceDock.x -= this.deskMenu.width;
            this.deskMenu.x -= this.deskMenu.width;
            this.headerLogo.body.style.background = "";
            this.headerLogo.imageBody.style.fill = "";
            this.headerLogo.imageBody.style.stroke = "";
            this.deskMenu.active = false;
        }
    }

    /**
     * @todo initialize in constructor
     */
    getDeskUI = Object.freeze({
        CloseButton: "/System/Desk/Resources/DICloseButton.svg",
        MinimizeButton: "/System/Desk/Resources/DIMinimizeButton.svg",
        MaximizeButton: "/System/Desk/Resources/DIMaximizeButton.svg",
        SettingButton: "/System/Desk/Resources/DISettingButton.svg",
        BackButton: "/System/Desk/Resources/DIBackButton.svg",
        AddButton: "/System/Desk/Resources/DIAddButton.svg",
        UploadButton: "/System/Desk/Resources/DIUploadButton.svg",
        SearchIcon: "/System/Desk/Resources/DISearch.svg",
        SaveIcon: "/System/Desk/Resources/DISave.svg",
        ComboBoxArrow: "/System/Desk/Resources/DIComboBoxArrow.svg",
        PlayButton: "/System/Desk/Resources/DIPlayButton.svg",
        PauseButton: "/System/Desk/Resources/DIPauseButton.svg",
        FullScreenButton: "/System/Desk/Resources/DIFullScreenButton.svg",
    });
}
