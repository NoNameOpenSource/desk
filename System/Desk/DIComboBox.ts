import { DeskEvent } from "../Secretary/DeskEvent";
import { DITextField } from "./DITextField";

/**
 * This is a simple way to display an image
 */
export class DIComboBox extends DITextField {
    items: string[];
    searchedItems: any[];
    deleteKey: boolean;
    oldString: string;
    useDataSource: any;

    constructor(className?: string, idName?: string) {
        if (!className) className = "DITextField";
        super(false, true, className, idName);
        this.items = [];
        this.searchedItems = [];

        this.deleteKey = true;

        this.oldString = "";
    }

    keyDown(evt: KeyboardEvent) {
        if (evt.key === "Backspace" || evt.key === "Delete") {
            this.deleteKey = true;
        } else {
            this.deleteKey = false;
        }
    }

    searchHints() {
        if (this.oldString === this.stringValue || this.deleteKey) return;
        else this.oldString = this.stringValue;
        this.searchedItems.length = 0;
        let i;
        for (i = 0; i < this.items.length; i++) {
            if (this.items[i].indexOf(this.stringValue) === 0) {
                const start = this.stringValue.length;
                this.stringValue = this.items[i];
                this.textBody.setSelectionRange(start, this.items[i].length);
                this.searchedItems.push(this.items[i]);
            }
        }
        for (; i < this.items.length; i++) {
            if (this.items[i].indexOf(this.stringValue) === 0) {
                this.searchedItems.push(this.items[i]);
            }
        }
    }

    addItem(item: string) {
        if (this.useDataSource) {
        } else {
            this.items.push(item);
        }
    }

    addItems() {
        // eslint-disable-next-line prefer-rest-params
        for (const argument of arguments) {
            this.addItem(<string>argument);
        }
    }

    didMoveToDesk() {
        this._width = this.body.offsetWidth;
        this._height = this.body.offsetHeight;
        this.events.push(new DeskEvent(this.textBody, "keydown", (evt: KeyboardEvent) => this.keyDown(evt)));
        this.events.push(new DeskEvent(this.textBody, "input", () => this.searchHints()));
    }
}
