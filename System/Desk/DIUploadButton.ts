import { DeskEvent } from "../Secretary/DeskEvent";
import { DIButton } from "./DIButton";

/**
 * This is simple button for the system
 */
export class DIUploadButton extends DIButton {
    inputBody: HTMLInputElement;
    buttonEvent: DeskEvent;

    constructor(text: string, className?: string, idName?: string) {
        super(text, className, idName);
        this.inputBody = document.createElement("input");
        this.inputBody.setAttribute("type", "file");
        this.inputBody.style.display = "none";
        this.body.appendChild(this.inputBody);
        this.buttonEvent = new DeskEvent(this.buttonBody, "click", () => {
            this.inputBody.click();
        });
    }

    setButtonEvent(evt: any) {
        if (this.event) this.event.delete();
        this.event = new DeskEvent(this.inputBody, "change", evt);
    }

    delete() {
        this.inputBody.remove();
        this.buttonEvent.delete();
        this.buttonEvent = null;
        super.delete();
    }
}
