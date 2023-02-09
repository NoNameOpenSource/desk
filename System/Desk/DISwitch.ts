import { DeskEventInfo } from "../Secretary/DeskEventManager";
import { DIView } from "./DIView";

/**
 * This is simple button for the system
 */
export class DISwitch extends DIView {
    eventInfo: DeskEventInfo;
    switchBody: HTMLLabelElement & { firstChild: FirstChild };
    buttonBody: any;

    constructor(small: any, className?: string, idName?: string) {
        if (!className) {
            if (small) className = "DISmallSwitch";
            else className = "DISwitch";
        }
        super(className, idName);
        this.canHaveChild = false;
        this.eventInfo = null;

        const switchBody = document.createElement("label");
        switchBody.appendChild(document.createElement("input"));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        switchBody.firstChild.setAttribute("type", "checkbox");
        this.switchBody = <HTMLLabelElement & { firstChild: FirstChild }>switchBody;
        // @ts-ignore TODO: bug
        this.switchBody.appendChild(document.createElement("div"));
        if (small) this.switchBody.children[1].className = "DISmallSwitchSlider";
        else this.switchBody.children[1].className = "DISwitchSlider";
        this.body.appendChild(this.switchBody);
        this._width = 290;
    }

    putInSleep() {
        super.putInSleep();
    }

    wakeUp() {
        super.wakeUp();
    }

    setSwitchEvent(evt: (this: Element, ev: any) => any) {
        this.eventManager.delete(this.eventInfo?.id);
        // @ts-ignore TODO: make DeskEvent accept a Pick containing only the properties it needs
        this.event = this.eventManager.add(this.switchBody.firstChild, "change", evt);
    }

    get value() {
        return this.switchBody.firstChild.checked;
    }

    set value(value) {
        this.switchBody.firstChild.checked = value;
    }

    // eslint-disable-next-line class-methods-use-this
    get width() {
        // @ts-ignore TODO: this?
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return _width;
    }

    set width(value) {
        this._width = value;
        this.buttonBody.style.width = `${value}px`;
    }

    delete() {
        // Remove EventListener
        this.eventManager.delete(this.eventInfo?.id);
        this.switchBody.remove();
        super.delete();
    }
}

interface FirstChild extends ChildNode {
    checked: boolean;
}
