import { DIView } from "./DIView";


export class DICheckbox extends DIView {
	name: string;
	inputBody: HTMLInputElement;
	labelBody: HTMLElement;

	constructor(text, className, idName) {
		if(!className)
			className='DICheckbox';
		super(className, idName);
		this.canHaveChild = false;
		this.name = "" + new Date().getTime();
		this.inputBody = <HTMLInputElement>document.createElement('INPUT');
		this.inputBody.setAttribute("type", "checkbox");
		// @ts-ignore TODO: bug
		this.inputBody.setAttribute("name", name);
		this.body.appendChild(this.inputBody);
		this.labelBody = document.createElement('LABEL');
		// @ts-ignore TODO: bug
		this.labelBody.setAttribute("for", name);
		this.body.appendChild(this.labelBody);
		if(text)
			this.stringValue = text;
	}
	
	get value() {
		return this.inputBody.checked;
	}
	
	set value(value) {
		this.inputBody.checked = value;
	}
	
	get stringValue() {
		return this.labelBody.innerText;
	}
	
	set stringValue(value) {
		this.labelBody.innerText = value;
	}
}