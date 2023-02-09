import { DeskEventInfo, DeskEventManager } from "../Secretary/DeskEventManager";
import { DITableView } from "./DITableView";

export class DITableCell {
    body: HTMLTableCellElement;
    table: DITableView;
    editable: boolean;
    blurEventInfo: DeskEventInfo;
    oldValue: any;
    eventManager: DeskEventManager;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(className?: string, idName?: string) {
        if (!className) className = "DITableView";
        this.body = document.createElement("td");
        this.table;
        this.editable = true;
        this.eventManager = new DeskEventManager();
        this.eventManager.add(this.body, "dblclick", this.dblclick);
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
        this.blurEventInfo = this.eventManager.add(this.body, "blur", this.endEdit);
        this.oldValue = this.text;
        this.body.setAttribute("contentEditable", undefined);
        this.body.focus();
    }

    endEdit() {
        this.eventManager.delete(this.blurEventInfo?.id);
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
