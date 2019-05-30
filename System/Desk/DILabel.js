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

class DILabel extends DIView {
	constructor(text, className, idName) {
		if(!className)
			className='DILabel';
		super(className, idName);
		this.canHaveChild = false;
		this.textBody = document.createElement('P');
		if(text)
			this.textBody.textContent = text;
		this.body.appendChild(this.textBody);
	}
	
	didMoveToDesk() {
		this._width = this.body.offsetWidth;
		this._height = this.body.offsetHeight;
	}
	
	get stringValue() {
		return this.textBody.textContent;
	}
	
	set stringValue(value) {
		this.textBody.textContent = value;
	}
	
	get width() {
		return this._width;
	}
	
	set width(value) {
		this._width = value;
		this.body.style.width = "".concat(value, "px");
		//this.textBody.style.width = "".concat(value, "px");
	}
	
	delete() {
		this.textBody.remove();
		super.delete();
	}
}