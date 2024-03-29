import { DIView } from "./DIView";

/**
 * This is a simple way to display an image
 */
export class DITextArea extends DIView {
    private _editable: boolean;

    constructor(placeHolder: string, editable: boolean, className?: string, idName?: string) {
        if (!className) className = "DITextField";
        super(className, idName);
        this.canHaveChild = false;
        // @ts-ignore TODO: bug
        this.textBody = document.createElement("textarea");
        if (placeHolder) this.textBody.setAttribute("placeholder", placeHolder);
        this._editable = true;
        if (editable === false) {
            this._editable = false;
            this.textBody.disabled = true;
        }
        this.body.appendChild(this.textBody);
    }

    /**
     * @returns The index of the beginning of selected text. If no text is selected, contains the index of the character that follows the input cursor.
     */
    selectedLocation() {
        if (this._editable) {
            return this.textBody.selectionStart;
        }
        return false;
    }

    didMoveToDesk() {
        this.rect.width = this.body.offsetWidth;
        this.rect.height = this.body.offsetHeight;
    }

    get editable() {
        return this._editable;
    }

    set editable(value) {
        this._editable = value;
        if (value) this.textBody.disabled = false;
        else this.textBody.disabled = true;
    }

    get stringValue() {
        return this.textBody.value;
    }

    set stringValue(value) {
        this.textBody.value = value;
    }

    get width() {
        return this.rect.width;
    }

    set width(value) {
        this.rect.width = value;
        this.body.style.width = `${value}px`;
        this.textBody.style.width = this.body.style.width;
    }

    get value() {
        return this.textBody.value;
    }

    set value(value) {
        this.textBody.value = value;
    }

    get height() {
        return this.rect.height;
    }

    set height(value) {
        this.rect.height = value;
        this.body.style.height = `${value}px`;
        this.textBody.style.height = this.body.style.height;
    }

    delete() {
        this.textBody.remove();
        super.delete();
    }
}
