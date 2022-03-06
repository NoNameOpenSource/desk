/*
** Class	: DIImageView
** 
** This is a simple way to display an image
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DIClassicDropDownView extends DIView {
	constructor(className, idName) {
		if(!className)
			className='DIClassicDropDownView';
		super(className, idName);
		this.canHaveChild = false;
		this.selectBody = document.createElement('SELECT');
		this.body.appendChild(this.selectBody);
	}
	
	addItem(item) {
		var z = document.createElement("option");
		z.setAttribute("value", item );
		var t = document.createTextNode(item);
		z.appendChild(t);
		this.selectBody.appendChild(z);
	}
	
	addItems() {
		for(var i=0;i<arguments.length;i++)
			this.addItem(arguments[i]);
	}
	
	get selectedIndex() {
		return this.selectBody.selectedIndex;
	}
	
	set selectedIndex(value) {
		this.selectBody.selectedIndex = value;
	}
	
	get stringValue() {
		return this.selectBody.value;
	}
	
	set stringValue(value) {
		this.selectBody.value = value;
	}
}