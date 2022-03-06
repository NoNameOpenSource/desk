/**
 * View class for the items that will be displayed on the screen
 */
export class DIView {
    textBody: HTMLInputElement;

    canHaveChild = true;
    /** Array of child views of this view */
    children = new Array();
    parent: any;
    /** x coordinate */
    _x = 0;
    /** y coordinate */
    _y = 0;
    _width: any;
    _height: number;
    _inSleep;
    _controller: any = null;
    onDesk = false;
    /** Body of the view as HTML element */
    body: HTMLElement;
    events: any[];
    animations: any[];
    _hidden: boolean;
    deleted: boolean;

    /**
     * @todo accept only a string for className and idName params and pass undefined instead of false when necessary
     */
    constructor(className?: string, idName?: string) {
        this.body = document.createElement("DIView");
        if (className) this.body.className = <string>className;
        if (idName) this.body.id = idName;
        this.events = new Array();
        this.animations = new Array();
        this._hidden = false;
        this._inSleep = false;
    }

    addChildView(child: any) {
        if (!this.canHaveChild) return false;
        this.children.push(child);
        this.body.appendChild(child.body);
        child.parent = this;
        child.didMoveToParent();
        if (this.onDesk) child.didMoveToDesk();
        return true;
    }

    removeChildView(child: any) {
        var i = this.children.indexOf(child);
        this.body.removeChild(child.body);
        this.children[i] = null;
        this.children.splice(i, 1);
    }

    clearChildViews() {
        for (var i = this.children.length; i > 0; i--) {
            if (this.children[i - 1] == undefined) alert("error");
            this.children[i - 1].delete();
        }
        this.children.length = 0;
    }

    unplugChildViews() {
        for (var i = this.children.length; i > 0; i--) {
            this.children[i - 1].parent = null;
            this.body.removeChild(this.children[i - 1].body);
        }
        this.children.length = 0;
    }

    deleteEvent(event: any) {
        var i = this.events.indexOf(event);
        if (i == -1) return;
        event.delete();
        this.events[i] = null;
        this.events.splice(i, 1);
    }

    clearEvents() {
        for (var i = 0; i < this.events.length; i++) {
            this.events[i].delete();
        }
        this.events.length = 0;
    }

    clearAnimations() {
        for (var i = 0; i < this.animations.length; i++) {
            this.animations[i].delete();
        }
        this.events.length = 0;
    }

    didMoveToParent() {}

    didMoveToDesk() {
        this.onDesk = true;
        if (!this._width) this._width = this.body.offsetWidth;
        if (!this._height) this._height = this.body.offsetHeight;
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].didMoveToDesk();
        }
    }

    putInSleep() {
        this._inSleep = true;
        for (var i = 0; i < this.events.length; i++) {
            this.events[i].stop();
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].putInSleep();
        }
    }

    wakeUp() {
        this._inSleep = false;
        for (var i = 0; i < this.events.length; i++) {
            this.events[i].resume();
        }
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].wakeUp();
        }
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
        this.body.style.left = "".concat(`${value}`, "px");
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
        this.body.style.top = "".concat(`${value}`, "px");
    }

    get width() {
        if (!this._width) this._width = this.body.offsetWidth;
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.body.style.width = "".concat(value, "px");
    }

    get height() {
        if (!this._height) this._height = this.body.offsetHeight;
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.body.style.height = "".concat(`${value}`, "px");
    }

    get hidden() {
        return this._hidden;
    }

    set hidden(value) {
        if (this._hidden == value)
            // @ts-ignore TODO: bug
            return false;
        this._hidden = value;
        if (this._hidden) this.body.style.display = "none";
        else this.body.style.display = "";
    }

    delete() {
        this.deleted = true;
        this.clearChildViews();
        this.clearEvents();
        this.clearAnimations();
        if (this.parent) this.parent.removeChildView(this);
        this.body.remove();
        this.body = null;
        this.parent = null;
    }
}
