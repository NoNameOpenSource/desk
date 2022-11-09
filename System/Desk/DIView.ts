import * as Constrain from "@nonameopensource/constrain";
import { DeskAnimation, DeskEvent } from "../Secretary";
import { DIViewController } from "./DIViewController";

/**
 * View class for the items that will be displayed on the screen
 */
export class DIView implements Constrain.DrawableObject {
    textBody: HTMLInputElement;
    canHaveChild = true;
    /** Array of child views of this view */
    children: DIView[];
    parent: DIView;
    onDesk = false;
    /** Body of the view as HTML element */
    body: HTMLElement;
    events: DeskEvent[];
    animations: DeskAnimation[];
    deleted: boolean;
    _controller: DIViewController;
    constraintGroup: Constrain.LayoutEngine.ConstraintGroup;

    /** x coordinate */
    protected _x = 0;
    /** y coordinate */
    protected _y = 0;
    protected _width: number;
    protected _height: number;
    protected _inSleep: boolean;

    private _hidden: boolean;

    /**
     * @todo accept only a string for className and idName params and pass undefined instead of false when necessary
     */
    constructor(className?: string, idName?: string) {
        this.body = document.createElement("DIView");
        if (className) this.body.className = className;
        if (idName) this.body.id = idName;
        this.children = [];
        this.events = [];
        this.animations = [];
        this._hidden = false;
        this._inSleep = false;
        // @ts-ignore
        this.constraintGroup = {
            constraints: [],
            dirty: false,
            tree: undefined,
        };
    }

    addChildView(child: DIView) {
        if (!this.canHaveChild) return false;
        this.children.push(child);
        this.body.appendChild(child.body);
        child.parent = this;
        child.didMoveToParent();
        if (this.onDesk) child.didMoveToDesk();
        return true;
    }

    removeChildView(child: DIView) {
        const i = this.children.indexOf(child);
        this.body.removeChild(child.body);
        this.children[i] = null;
        this.children.splice(i, 1);
    }

    clearChildViews() {
        for (let i = this.children.length; i > 0; i--) {
            if (this.children[i - 1] === undefined) alert("error");
            this.children[i - 1].delete();
        }
        this.children.length = 0;
    }

    unplugChildViews() {
        for (let i = this.children.length; i > 0; i--) {
            this.children[i - 1].parent = null;
            this.body.removeChild(this.children[i - 1].body);
        }
        this.children.length = 0;
    }

    deleteEvent(event: DeskEvent) {
        const i = this.events.indexOf(event);
        if (i === -1) return;
        event.delete();
        this.events[i] = null;
        this.events.splice(i, 1);
    }

    clearEvents() {
        for (const event of this.events) {
            event.delete();
        }

        this.events.length = 0;
    }

    clearAnimations() {
        for (const animation of this.animations) {
            animation.delete();
        }
        this.events.length = 0;
    }

    addConstraint(constraint: Constrain.Constraint) {
        this.constraintGroup.constraints.push(constraint);
    }

    clearConstraints() {
        this.constraintGroup.constraints = [];
    }

    /**
     * @todo implement or remove
     */
    didMoveToParent() {
        throw new Error("Method not implemented.");
    }

    didMoveToDesk() {
        this.onDesk = true;
        if (!this._width) this._width = this.body.offsetWidth;
        if (!this._height) this._height = this.body.offsetHeight;
        for (const child of this.children) {
            child.didMoveToDesk();
        }
    }

    putInSleep() {
        this._inSleep = true;
        for (const event of this.events) {
            event.stop();
        }
        for (const child of this.children) {
            child.putInSleep();
        }
    }

    wakeUp() {
        this._inSleep = false;
        for (const event of this.events) {
            event.resume();
        }
        for (const child of this.children) {
            child.wakeUp();
        }
    }

    async update(rect: Constrain.LayoutDefinition) {
        this._x = rect.x;
        this._y = rect.y;
        this._width = rect.width;
        this._height = rect.height;

        // TODO: should we perform the DOM update here?
        // TODO: how should we deal with the units?

        // update children
        // TODO: we'd prefer to just return this promise and remove the async qualifier from the method
        await Constrain.LayoutEngine.compute(this);
    }

    atLeastOneChildWillBeUpdated() {
        // always allow children to be updated for now
        return true;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
        this.body.style.left = `${value}px`;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
        this.body.style.top = `${value}px`;
    }

    get width() {
        if (!this._width) this._width = this.body.offsetWidth;
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.body.style.width = `${value}px`;
    }

    get height() {
        if (!this._height) this._height = this.body.offsetHeight;
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.body.style.height = `${value}px`;
    }

    get hidden() {
        return this._hidden;
    }

    set hidden(value) {
        if (this._hidden === value)
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
