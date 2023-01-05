import { DeskEvent } from "../Secretary/DeskEvent";
import { DITableView } from "./DITableView";

export class DITableCell {
    body: HTMLTableCellElement;
    table: DITableView;
    editable: boolean;
    event: any;
    blurEvent: DeskEvent;
    oldValue: any;

    constructor(className?: string, _idName?: string) {
        if (!className) className = "DITableView";
        this.body = document.createElement("td");
        this.table;
        this.editable = true;
        this.event = new DeskEvent(this.body, "dblclick", () => this.dblclick());
    }

    dblclick() {
        let result = true;
        if (this.table) {
            result = this.table.cellClicked(this);
        }
        if (result && this.editable) {
            this.beginEdit();
        }
    }

    beginEdit() {
        this.blurEvent = new DeskEvent(this.body, "blur", () => this.endEdit());
        this.oldValue = this.text;
        this.body.setAttribute("contentEditable", undefined);
        this.body.focus();
    }

    endEdit() {
        this.blurEvent.delete();
        this.blurEvent = null;
        this.body.removeAttribute("contentEditable");

        if (!this.table && this.oldValue === this.text) {
            return;
        }
        this.table.cellUpdated(this);
    }

    get text() {
        return this.body.innerText;
    }

    set text(newValue) {
        this.body.innerText = newValue;
    }
}
