import { DeskEvent, DeskEventListener } from "../Secretary/DeskEvent";
import { DIView } from "./DIView";

/**
 * This is simple button for the system
 */
export class DIButton extends DIView {
    event: DeskEvent;
    buttonBody: HTMLImageElement;
    public input: HTMLInputElement;

    constructor(text: string, className?: string, idName?: string) {
        if (!className) className = "DIButton";
        super(className, idName);
        this.canHaveChild = false;
        this.event;
        this.buttonBody = document.createElement("img");
        if (text) this.buttonBody.textContent = text;
        this.body.appendChild(this.buttonBody);
        this._width = 290;
    }

    putInSleep() {
        super.putInSleep();
    }

    wakeUp() {
        super.wakeUp();
    }

    setButtonEvent(listener: DeskEventListener) {
        if (this.event) this.event.delete();
        this.event = new DeskEvent(this.buttonBody, "click", listener);
    }

    get stringValue() {
        return this.buttonBody.textContent;
    }

    set stringValue(value) {
        this.buttonBody.textContent = value;
    }

    get width() {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
        this.buttonBody.style.width = `${value}px`;
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
