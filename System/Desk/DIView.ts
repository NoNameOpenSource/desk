import * as Constrain from "@nonameopensource/constrain";
import { Rect } from "@nonameopensource/constrain/types/Rect";
import { DeskAnimation, DeskEventManager } from "../Secretary";
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
    eventManager: DeskEventManager;
    animations: DeskAnimation[];
    deleted: boolean;
    _controller: DIViewController;
    constraintGroup: Constrain.LayoutEngine.ConstraintGroup;
    rect: Rect;

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
        this.animations = [];
        this._hidden = false;
        this._inSleep = false;
        this.constraintGroup = new Constrain.LayoutEngine.ConstraintGroup(this, []);
        this.rect = new Rect(0, 0, 0, 0);
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

    deleteEvent(eventId: string) {
        this.eventManager.delete(eventId);
    }

    clearEvents() {
        this.eventManager.deleteAll();
    }

    clearAnimations() {
        for (const animation of this.animations) {
            animation.delete();
        }
        this.eventManager.deleteAll();
    }

    addConstraint(constraint: Constrain.Constraint) {
        this.constraintGroup.constraints.push(constraint);
        this.constraintGroup.computeOrder();
        this.constraintGroup.compute(this.rect);
    }

    addConstraints(constraints: Constrain.Constraint[]): void;
    addConstraints(...constraints: Constrain.Constraint[]): void;
    addConstraints(constraints: unknown): void {
        const cs = constraints as Constrain.Constraint[];
        this.constraintGroup.constraints.push(...cs);
        this.constraintGroup.computeOrder();
        this.constraintGroup.compute(this.rect);
    }

    clearConstraints() {
        this.constraintGroup.constraints = [];
    }

    // eslint-disable-next-line class-methods-use-this
    didMoveToParent() {}

    didMoveToDesk() {
        this.onDesk = true;
        for (const child of this.children) {
            child.didMoveToDesk();
        }
    }

    putInSleep() {
        this._inSleep = true;
        this.eventManager.stopAll();
        for (const child of this.children) {
            child.putInSleep();
        }
    }

    wakeUp() {
        this._inSleep = false;
        this.eventManager.resumeAll();
        for (const child of this.children) {
            child.wakeUp();
        }
    }

    async update(definition: Constrain.LayoutDefinition) {
        this.x = definition.x;
        this.y = definition.y;
        this.width = definition.width;
        this.height = definition.height;

        // TODO: should we perform the DOM update here?
        // TODO: how should we deal with the units?

        // update children
        this.constraintGroup.computeOrder();
        this.constraintGroup.compute(this.rect);
    }

    // eslint-disable-next-line class-methods-use-this
    atLeastOneChildWillBeUpdated() {
        // always allow children to be updated for now
        return true;
    }

    /** @deprecated */
    get x() {
        return this.rect.x;
    }

    /** @deprecated */
    set x(value) {
        this.rect.x = value;
        this.body.style.left = `${value}px`;
    }

    /** @deprecated */
    get y() {
        return this.rect.y;
    }

    /** @deprecated */
    set y(value) {
        this.rect.y = value;
        this.body.style.top = `${value}px`;
    }

    /** @deprecated */
    get width() {
        return this.rect.width;
    }

    /** @deprecated */
    set width(value) {
        this.rect.width = value;
        this.body.style.width = `${value}px`;
    }

    /** @deprecated */
    get height() {
        return this.rect.height;
    }

    /** @deprecated */
    set height(value) {
        this.rect.height = value;
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
        this.eventManager.deleteAll();
        this.clearAnimations();
        if (this.parent) this.parent.removeChildView(this);
        this.body.remove();
        this.body = null;
        this.parent = null;
    }
}
