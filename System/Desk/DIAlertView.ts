import { DIButton } from "./DIButton";
import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
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
    buttons: any[];
    alertContent: any;
    private _useTextArea: boolean;
    autoHeight: boolean;
    icon: any;
    textArea: DIView;

    constructor(text?: string, icon?: any, className?: string, idName?: string) {
        if (!className) className = "DIAlertView";
        super(className, idName);
        this.buttons = new Array();
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

    addButton(text: string, evt: any) {
        var id = this.buttons.length;
        this.buttons.push(new DIButton(text, "DIAlertViewButton"));
        //this.buttons[id].y = 10;
        this.buttons[id].setButtonEvent(evt);
        this.addChildView(this.buttons[id]);
        return id;
    }

    didMoveToDesk() {
        if (this.autoHeight) {
            if (this._useTextArea) this.height = this.alertContent.body.offsetHeight + 251;
            else this.height = this.alertContent.body.offsetHeight + 51;
        }
        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].x = this.width + 5 - 140 * (i + 1);
        }
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
