import { DeskEvent } from "../Secretary/DeskEvent";
import { DIView } from "./DIView";

/**
 * This is simple button for the system
 *
 * -x				: x coordinate
 * -y				: y coordinate
 * -body			: Body of the view as HTML element
 * -child			: Array of child views of this view
 */
export class DIButton extends DIView {
    event: any;
    buttonBody: HTMLButtonElement;

    constructor(text: string, className?: string, idName?: string) {
        if (!className) className = "DIButton";
        super(className, idName);
        this.canHaveChild = false;
        this.event;
        this.buttonBody = document.createElement("button");
        if (text) this.buttonBody.textContent = text;
        this.body.appendChild(this.buttonBody);
        this._width = 290;
    }

    putInSleep() {
        //if(this.event)
        //	this.event.stop();
        super.putInSleep();
    }

    wakeUp() {
        //if(this.event)
        //	this.event.resume();
        super.wakeUp();
    }

    setButtonEvent(evt) {
        if (this.event) this.event.delete();
        this.event = new DeskEvent(this.buttonBody, "click", evt);
    }

    get stringValue() {
        return this.buttonBody.textContent;
    }

    set stringValue(value) {
        this.buttonBody.textContent = value;
    }

    get width() {
        // @ts-ignore TODO: bug - maybe use this._width?
        return _width;
    }

    set width(value) {
        this._width = value;
        this.buttonBody.style.width = "".concat(value, "px");
    }

    delete() {
        // Remove EventListener
        if (this.event) {
            this.event.delete();
            this.event = null;
        }
        this.buttonBody.remove();
        super.delete();
    }
}
