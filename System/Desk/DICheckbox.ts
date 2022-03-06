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

class DICheckbox extends DIView {
	constructor(text, className, idName) {
		if(!className)
			className='DICheckbox';
		super(className, idName);
		this.canHaveChild = false;
		this.name = "" + new Date().getTime();
		this.inputBody = document.createElement('INPUT');
		this.inputBody.setAttribute("type", "checkbox");
		this.inputBody.setAttribute("name", name);
		this.body.appendChild(this.inputBody);
		this.labelBody = document.createElement('LABEL');
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