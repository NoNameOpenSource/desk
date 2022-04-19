import { DeskEvent } from "../Secretary";
import { DIButton } from "./DIButton";
import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
import { DIView } from "./DIView";

/**
 * Sample alert for the system
 */
export class DISimpleAlertView extends DIView {
    autoHeight: boolean;
    buttons: DIButton[];
    alertContent: DILabel;
    icon: DIView;
    _useTextArea: boolean;
    textArea: DIView;

    constructor(text: string, icon: string, className?: string, idName?: string) {
        if (!className) className = "DISmallAlertView";
        super(className, idName);
        this.buttons = [];
        // Add alert content
        this.alertContent = new DILabel("", "DIAlertViewContent");
        if (text) this.alertContent.stringValue = text;
        this.addChildView(this.alertContent);
        this.autoHeight = true;
        if (icon) {
            this.icon = new DIImageView(icon, "DIAlertViewIcon");
            this.addChildView(this.icon);
        }
        this._useTextArea = false;
    }

    get stringValue() {
        return this.alertContent.stringValue;
    }

    set stringValue(value) {
        this.alertContent.stringValue = value;
    }

    useTextArea(text: string) {
        if (!this._useTextArea) {
            this.textArea = new DIView("DIAlertViewTextArea");
            // @ts-ignore TODO: bug
            this.textArea.textBody = document.createElement("DIV");
            this.textArea.textBody.innerHTML = text;
            this.textArea.body.appendChild(this.textArea.textBody);
            this.addChildView(this.textArea);
            this._useTextArea = true;
        }
    }

    addButton(text: string, evt: DeskEvent) {
        const id = this.buttons.length;
        this.buttons.push(new DIButton(text, "DISmallAlertViewButton"));
        this.buttons[id].body.style.width = "50%";
        //this.buttons[id].y = 10;
        // @ts-ignore
        this.buttons[id].setButtonEvent(evt);
        this.addChildView(this.buttons[id]);
        return id;
    }

    didMoveToDesk() {
        if (this.autoHeight) {
            if (this._useTextArea) this.height = this.alertContent.body.offsetHeight + 239;
            else this.height = this.alertContent.body.offsetHeight + 39;
        }
        this.buttons[0].x = 0;
        this.buttons[0].y = this.height - 33;
        this.buttons[1].x = this.width / 2;
        this.buttons[1].y = this.height - 33;
    }

    delete() {
        //for(var i = 0; i < this.buttons.length; i++) {
        //	this.buttons[i].delete();
        //}
        this.alertContent = null;
        this.icon = null;
        this.buttons.length = 0;
        this.buttons = null;
        //this.alertContent.delete();
        super.delete();
    }
}
