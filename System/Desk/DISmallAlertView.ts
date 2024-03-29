import { DeskEventInfo } from "../Secretary/DeskEventManager";
import { DIAlertView } from "./DIAlertView";
import { DIButton } from "./DIButton";
import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
import { DIView } from "./DIView";

/**
 * Sample alert for the system
 */
export class DISmallAlertView extends DIAlertView {
    buttons: DIButton[];
    alertContent: DILabel;
    autoHeight: boolean;
    icon: DIView;
    textArea: DIView;

    constructor(text: string, icon: string, className?: string, idName?: string) {
        if (!className) className = "DISmallAlertView";
        super(className, idName);
        this.buttons = [];
        // Add alert content
        // TODO: why is something called "alertContent" a DILabel?
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

    addButton(text: string, evt: (this: Element, ev: DeskEventInfo) => any) {
        const id = this.buttons.length;
        this.buttons.push(new DIButton(text, "DISmallAlertViewButton"));
        // @ts-ignore
        this.buttons[id].setButtonEvent(evt);
        this.addChildView(this.buttons[id]);
        return id;
    }

    didMoveToDesk() {
        let height;
        if (this.autoHeight) {
            if (this._useTextArea) height = this.alertContent.body.offsetHeight + 206;
            else height = this.alertContent.body.offsetHeight + 6;
        } else {
            height = this.height - this.buttons.length * 33;
        }
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].y = height + 33 * i;
        }
        this.height = height;
    }

    delete() {
        this.alertContent = null;
        this.icon = null;
        this.buttons.length = 0;
        this.buttons = null;
        super.delete();
    }
}
