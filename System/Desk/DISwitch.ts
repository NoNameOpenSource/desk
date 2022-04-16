import { DeskEvent } from "../Secretary/DeskEvent";
import { DIView } from "./DIView";

/**
 * This is simple button for the system
 */
export class DISwitch extends DIView {
    event: any;
    switchBody: HTMLLabelElement;
    buttonBody: any;

    constructor(small: any, className?: string, idName?: string) {
        if (!className) {
            if (small) className = "DISmallSwitch";
            else className = "DISwitch";
        }
        super(className, idName);
        this.canHaveChild = false;
        this.event;
        this.switchBody = document.createElement("label");
        this.switchBody.appendChild(document.createElement("input"));
        // @ts-ignore TODO: bug
        this.switchBody.firstChild.setAttribute("type", "checkbox");
        this.switchBody.appendChild(document.createElement("div"));
        if (small) this.switchBody.children[1].className = "DISmallSwitchSlider";
        else this.switchBody.children[1].className = "DISwitchSlider";
        this.body.appendChild(this.switchBody);
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

    setSwitchEvent(evt: any) {
        if (this.event) this.event.delete();
        this.event = new DeskEvent(this.switchBody.firstChild, "change", evt);
    }

    get value() {
        // @ts-ignore TODO: bug
        return this.switchBody.firstChild.checked;
    }

    set value(value) {
        // @ts-ignore TODO: bug
        this.switchBody.firstChild.checked = value;
    }

    get width() {
        // @ts-ignore TODO: this?
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
        this.switchBody.remove();
        super.delete();
    }
}
