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
        this.rect.width = this.body.offsetWidth;
        this.rect.height = this.body.offsetHeight;
    }

    get stringValue() {
        return this.textBody.textContent;
    }

    set stringValue(value) {
        this.textBody.textContent = value;
    }

    get width() {
        return this.rect.width;
    }

    set width(value) {
        this.rect.width = value;
        this.body.style.width = `${value}px`;
    }

    delete() {
        this.textBody.remove();
        super.delete();
    }
}
