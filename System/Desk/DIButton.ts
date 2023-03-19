import { DeskEventInfo } from "../Secretary/DeskEventManager";
import { DIView } from "./DIView";

/**
 * This is simple button for the system
 */
export class DIButton extends DIView {
    eventInfo: DeskEventInfo;
    buttonBody: HTMLImageElement;
    public input: HTMLInputElement;

    constructor(text: string, className?: string, idName?: string) {
        if (!className) className = "DIButton";
        super(className, idName);
        this.canHaveChild = false;
        this.eventInfo;
        this.buttonBody = document.createElement("img");
        if (text) this.buttonBody.textContent = text;
        this.body.appendChild(this.buttonBody);
        this.rect.width = 290;
    }

    putInSleep() {
        super.putInSleep();
    }

    wakeUp() {
        super.wakeUp();
    }

    setButtonEvent(evt: (this: Element, ev: DeskEventInfo) => any) {
        this.eventManager.delete(this.eventInfo?.id);
        this.eventInfo = this.eventManager.add(this.buttonBody, "click", evt);
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
        this.rect.width = value;
        this.buttonBody.style.width = `${value}px`;
    }

    delete() {
        // Remove EventListener
        this.eventManager.delete(this.eventInfo?.id);
        this.buttonBody.remove();
        super.delete();
    }
}
