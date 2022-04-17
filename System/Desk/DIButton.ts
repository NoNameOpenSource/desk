import { DeskEvent } from "../Secretary/DeskEvent";
import { DIView } from "./DIView";

/**
 * This is simple button for the system
 */
export class DIButton extends DIView {
    event: DeskEvent;
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

    setButtonEvent(evt: (this: HTMLElement, ev: any) => any) {
        if (this.event) this.event.delete();
        this.event = new DeskEvent(this.buttonBody, "click", evt);
    }

    get stringValue() {
        return this.buttonBody.textContent;
    }

    set stringValue(value) {
        this.buttonBody.textContent = value;
    }

    // eslint-disable-next-line class-methods-use-this
    get width() {
        // @ts-ignore TODO: bug - maybe use this._width?
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return _width;
    }

    set width(value: number) {
        this._width = value;
        this.buttonBody.style.width = "".concat(`${value}`, "px");
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
