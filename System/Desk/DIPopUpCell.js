/*
** Class	: DIListViewCell
** 
** Cell for the view
** 
** properties
**	-listCell		: Class that will be used for make cells
**	-cell			: Array of the cells
**
*/

class DIPopUpCell extends DIView {
	constructor(name, className, idName) {
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