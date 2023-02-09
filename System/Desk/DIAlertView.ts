import { DeskEventInfo } from "../Secretary";
import { DIButton } from "./DIButton";
import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
import { DITextField } from "./DITextField";
import { DIView } from "./DIView";

/**
 * Sample alert for the system
 *
 * -x				: x coordinate
 * -y				: y coordinate
 * -body			: Body of the view as HTML element
 * -child			: Array of child views of this view
 */
export class DIAlertView extends DIView {
    buttons: DIButton[];
    alertContent: DILabel;
    autoHeight: boolean;
    icon: DIView;
    textArea: DIView;
    public textField: DITextField;

    protected _useTextArea: boolean;

    constructor(text?: string, icon?: string, className?: string, idName?: string) {
        if (!className) className = "DIAlertView";
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

    addButton(text: string, evt: (this: Element, ev: DeskEventInfo) => any) {
        const id = this.buttons.length;
        this.buttons.push(new DIButton(text, "DIAlertViewButton"));
        this.buttons[id].setButtonEvent(evt);
        this.addChildView(this.buttons[id]);
        return id;
    }

    didMoveToDesk() {
        if (this.autoHeight) {
            if (this._useTextArea) this.height = this.alertContent.body.offsetHeight + 251;
            else this.height = this.alertContent.body.offsetHeight + 51;
        }
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].x = this.width + 5 - 140 * (i + 1);
        }
    }

    delete() {
        this.alertContent = null;
        this.icon = null;
        this.buttons.length = 0;
        this.buttons = null;
        super.delete();
    }
}
