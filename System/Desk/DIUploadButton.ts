import { DeskEventInfo } from "../Secretary/DeskEventManager";
import { DIButton } from "./DIButton";

/**
 * This is simple button for the system
 */
export class DIUploadButton extends DIButton {
    inputBody: HTMLInputElement;
    buttonEventInfo: DeskEventInfo;

    constructor(text: string, className?: string, idName?: string) {
        super(text, className, idName);
        this.inputBody = document.createElement("input");
        this.inputBody.setAttribute("type", "file");
        this.inputBody.style.display = "none";
        this.body.appendChild(this.inputBody);
        this.buttonEventInfo = this.eventManager.add(this.buttonBody, "click", () => {
            this.inputBody.click();
        });
    }

    setButtonEvent(evt: (this: Element, ev: any) => any) {
        this.eventManager.delete(this.eventInfo?.id);
        this.eventInfo = this.eventManager.add(this.inputBody, "change", evt);
    }

    delete() {
        this.inputBody.remove();
        this.eventManager.delete(this.buttonEventInfo?.id);
        super.delete();
    }
}
