import { DIView } from "./DIView";

export class DILabel extends DIView {
    canHaveChild: boolean;

    // TODO: make text optional and pass undefined instead of false when necessary
    constructor(text?: string, className?: string, idName?: string) {
        if (!className) className = "DILabel";
        super(className, idName);
        this.canHaveChild = false;
        // @ts-ignore TODO: bug
        this.textBody = document.createElement("P");
        if (text) this.textBody.textContent = text;
        this.body.appendChild(this.textBody);
    }

    didMoveToDesk() {
        this._width = this.body.offsetWidth;
        this._height = this.body.offsetHeight;
    }

    get stringValue() {
        return this.textBody.textContent;
    }

    set stringValue(value) {
        this.textBody.textContent = value;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.body.style.width = "".concat(`${value}`, "px");
        // this.textBody.style.width = "".concat(value, "px");
    }

    delete() {
        this.textBody.remove();
        super.delete();
    }
}
