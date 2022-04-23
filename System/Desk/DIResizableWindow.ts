import { Application } from "../Secretary";
import { DeskEvent } from "../Secretary/DeskEvent";
import { Desk } from "./Desk";
import { DILabel } from "./DILabel";
import { DIView } from "./DIView";

/**
 * Window class for the system
 */
export class DIResizableWindow extends DIView {
    child: DIView;
    parent: DIView;
    events: DeskEvent[];
    _x: number;
    _y: number;
    _z: number;
    _width: number;
    _height: number;
    deleted: boolean;
    resize: boolean;
    cursor: number;
    tmp: any;
    body: HTMLElement;
    titleBar: DIView;
    titleField: DILabel;
    titleBarOptions: number;
    border: any[];
    _title: string;
    closeButton: any;
    minButton: any;
    maxButton: any;
    app: Application;
    desk: Desk;

    constructor(className: string, idName: string, title: string, x: number, y: number, width: number, height: number, titleBarOptions = 1) {
        super();
        this.desk = Desk.getInstance();
        this.child;
        this.parent;
        this.events = [];
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._width = 0;
        this._height = 0;
        this.deleted = false;
        this.resize = true;
        this.cursor = 0;

        this.tmp;

        this.body = document.createElement("DIWindowBorder");
        this.body.appendChild(document.createElement("DIWindow"));
        // @ts-ignore TODO: type body differently?
        this.body.childNodes[0].style.bottom = "5px";
        // @ts-ignore TODO: type body differently?
        this.body.childNodes[0].style.left = "5px";
        if (className) this.body.className = className;
        if (idName) this.body.id = idName;
        // TitleBar Initialization
        if (titleBarOptions < 5) {
            this.titleBar = new DIView("DIWindowTitleBar");
            this.titleBar.height = 20;
            this.body.childNodes[0].appendChild(this.titleBar.body);
            this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
            // Add title to titleBar
            if (titleBarOptions < 3) {
                this.titleField = new DILabel(undefined, "DIWindowTitle");
                this.titleBar.addChildView(this.titleField);
            }
        }
        if (title) this.title = title;
        if (x) this.x = x;
        if (y) this.y = y;
        if (width) this.width = width;
        if (height) this.height = height;
        if (titleBarOptions) this.titleBarOptions = titleBarOptions;
    }

    mouseDown(evt: MouseEvent) {
        if (evt.button === 0) {
            // If primary button
            // Convert coord.
            const x = evt.clientX - this.x;
            const y = this.desk.screenHeight - evt.clientY - this.y;
            this.desk.bringWindowFront(this);
            if (this.resize && (x < 5 || x > this.width - 5)) {
                // Resizing window in X
            } else if (this.height - y < 0) {
                // TitleBar got clicked
                evt.preventDefault(); // Disable text selection
                // @ts-ignore TODO: bug
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                this.desk.beginWindowDrag(this, evt.clientX, evt.clientY);
                return false; // Disable text selection
            }
        }
    }

    changeCursor(cursor: any) {
        if (cursor === this.cursor) return false;
        this.body.style.setProperty("cursor", this.desk.cursor[cursor], "important");
        this.cursor = cursor;
    }

    setChildView(child: DIView) {
        this.child = child;
        this.body.childNodes[0].appendChild(child.body);
        child.parent = this;
        child.didMoveToParent();
        child.x = 0;
        child.y = 0;
        return true;
    }

    removeChildView(child: any) {
        if (this.child === child) this.child = null;
        else return false;
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    didMoveToParent() {}

    didMoveToDesk() {
        if (this.child) {
            this.child.didMoveToDesk();
            if (this.width === 0) this.width = this.child.width;
            else this.child.width = this.width;
            if (this.height === 0) this.height = this.child.height;
            else this.child.height = this.height;
        }
        // Make window border
        this.border = [];
        for (let i = 0; i < 4; i++) {
            this.border.push(document.createElement("DIWindowBorder"));
            this.border[i].className = "DIWindowBorder".concat(`${i}`);
            this.body.childNodes[0].appendChild(this.border[i]);
        }
    }

    putInSleep() {
        this.body.style.cursor = "default";
        this.child.putInSleep();
    }

    wakeUp() {
        this.body.style.cursor = "";
        this.child.wakeUp();
    }

    get background() {
        // @ts-ignore TODO: does a childNode have a style property?
        return <string>this.body.childNodes[0].style.background;
    }

    set background(value) {
        // @ts-ignore TODO: does a childNode have a style property?
        this.body.childNodes[0].style.background = value;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        if (value < 20 - this.width) value = 20 - this.width;
        if (value > this.desk.screenWidth - 20) value = this.desk.screenWidth - 20;
        this._x = value;
        this.body.style.left = `${value}px`;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        if (value < -this.height) value = -this.height;
        this._y = value;
        this.body.style.bottom = `${value}px`;
    }

    get z() {
        return this._z;
    }

    set z(value) {
        this._z = value;
        if (this.body) this.body.style.zIndex = `${value}px`;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.titleBar.width = value;
        if (this.child) this.child.width = value;
        // @ts-ignore TODO: type body differently?
        this.body.childNodes[0].style.width = `${value}px`;
        value += 10;
        this.body.style.width = `${value}px`;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        if (this.child) this.child.height = value;
        // @ts-ignore TODO: type body differently?
        this.body.childNodes[0].style.height = "".concat(value + this.titleBar.height, "px");
        value += 10;
        this.body.style.height = "".concat(`${value}` + this.titleBar.height, "px");
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
        if (this.titleBarOptions < 3) {
            this.titleField.stringValue = value;
        }
    }

    close() {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.parent.closeWindow(this);
    }

    delete() {
        this.deleted = true;
        this.closeButton = null;
        this.minButton = null;
        this.maxButton = null;
        this.titleField = null;
        if (this.titleBar) {
            this.titleBar.delete();
            this.titleBar = null;
        }
        for (const event of this.events) {
            event.delete();
        }
        this.events.length = 0;
        this.child.delete();
        this.body.remove();
        this.body = null;
        if (this.parent) this.parent = null;
        if (this.app && !this.app.deleted) {
            this.app.windowDidClose(this);
            this.app = null;
        }
    }
}
