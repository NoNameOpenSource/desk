import { DILabel } from "./DILabel";
import { DIView } from "./DIView";

/**
 * Cell for the view
 */
export class DIPopUpCell extends DIView {
	className: any;
	name: any;

	constructor(name: string, className?: string, idName?: string) {
		if(!className)
			className='DIPopUpCell';
		super(className, idName);
		this.className = className;
		this.name = new DILabel();
		if(name)
			this.name.stringValue=name;
		this.addChildView(this.name);
	}
	
	select() {
		this.body.className=this.className.concat("Selected");
	}
	
	deselect() {
		this.body.className=this.className;
	}
	
	delete() {
		this.name.delete();
		this.name=null;
		super.delete();
	}
}