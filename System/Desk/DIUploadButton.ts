import { DeskEvent } from "../Secretary/DeskEvent";
import { DIButton } from "./DIButton";

/**
 * This is simple button for the system
 */
export class DIUploadButton extends DIButton {
	inputBody: HTMLInputElement;
	buttonEvent: any;

	constructor(text: string, className?: string, idName?: string) {
		super(text, className, idName);
		this.inputBody = document.createElement('input');
		this.inputBody.setAttribute('type','file');
		this.inputBody.style.display='none';
		this.body.appendChild(this.inputBody);
		this.buttonEvent = new DeskEvent(this.buttonBody, "click", function() {
			this.inputBody.click();
		}.bind(this));
	}
	
	setButtonEvent(evt) {
		if(this.event)
			this.event.delete();
		this.event = new DeskEvent(this.inputBody, "change", evt);
	}
	
	delete() {
		this.inputBody.remove();
		this.buttonEvent.delete();
		this.buttonEvent = null;
		super.delete();
	}
}