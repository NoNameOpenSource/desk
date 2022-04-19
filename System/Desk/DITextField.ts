import { DIView } from "./DIView";

/**
 * This is a simple way to display an image
 */
export class DITextField extends DIView {
    private _editable: boolean;

    constructor(placeHolder: any, editable: boolean, className?: string, idName?: string) {
        if (!className) className = "DITextField";
        super(className, idName);
        this.canHaveChild = false;
        this.textBody = document.createElement("input");
        if (placeHolder) this.textBody.value = placeHolder;
        this._editable = true;
        if (editable === false) {
            this._editable = false;
            this.textBody.disabled = true;
        }
        this.body.appendChild(this.textBody);
    }

    /**
     * The index of the beginning of selected text. If no text is selected, contains the index of the character that follows the input cursor.
     * @returns
     */
    selectedLocation() {
        if (this._editable) {
            return this.textBody.selectionStart;
        }
        return false;
    }

    didMoveToDesk() {
        this._width = this.body.offsetWidth;
        this._height = this.body.offsetHeight;
    }

    get editable() {
        return this._editable;
    }

    set editable(value) {
        this._editable = value;
        // @ts-ignore
        if (value) this.textBody.disabled = false;
        // @ts-ignore
        else this.textBody.disabled = true;
    }

    get stringValue() {
        // @ts-ignore
        return this.textBody.value;
    }

    set stringValue(value) {
        // @ts-ignore
        this.textBody.value = value;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.body.style.width = `${value}px`;
        this.textBody.style.width = this.body.style.width;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.body.style.height = `${value}px`;
        this.textBody.style.height = this.body.style.height;
    }

    delete() {
        this.textBody.remove();
        super.delete();
    }
}
