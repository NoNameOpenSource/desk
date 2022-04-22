import { DeskEvent } from "../Secretary/DeskEvent";
import { DITableView } from "./DITableView";

export class DITableCell {
    body: HTMLTableCellElement;
    table: DITableView;
    editable: boolean;
    event: any;
    blurEvent: DeskEvent;
    oldValue: any;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(className?: string, idName?: string) {
        if (!className) className = "DITableView";
        this.body = document.createElement("td");
        this.table;
        this.editable = true;
        this.event = new DeskEvent(this.body, "dblclick", this.dblclick.bind(this));
    }

    /**
     * @todo remove or use evt
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dblclick(evt: any) {
        let result = true;
        if (this.table) {
            result = this.table.cellClicked(this);
        }
        if (result && this.editable) {
            this.beginEdit();
        }
    }

    beginEdit() {
        this.blurEvent = new DeskEvent(this.body, "blur", this.endEdit.bind(this));
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
