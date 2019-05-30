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

class DITextField extends DIView {
	constructor(placeHolder, editable, className, idName) {
		if(!className)
			className='DITextField';
		super(className, idName);
		this.canHaveChild = false;
		this.textBody = document.createElement('input');
		if(placeHolder)
			this.textBody.value = placeHolder;
		this._editable=true;
		if(editable==false) {
			this._editable=false;
			this.textBody.disabled=true;
		}
		this.body.appendChild(this.textBody);
	}
	
	
	
	/*
	** selectedLocation
	** 
	** return	: The index of the beginning of selected text. If no text is selected, contains the index of the character that follows the input cursor.
	**
	*/
	selectedLocation() {
		if(this._editable) {
			return this.textBody.selelctionStart;
		}
		return false;
	}
	
	didMoveToDesk() {
		this._width = this.body.offsetWidth;
		this._height = this.body.offsetHeight;
	}
	
	get editable() {
		return this._editable;
	}
	
	set editable(value) {
		this._editable=value;
		if(value)
			this.textBody.disabled=false;
		else
			this.textBody.disabled=true;
	}
	
	get stringValue() {
		return this.textBody.value;
	}
	
	set stringValue(value) {
		this.textBody.value = value;
	}
	
	get width() {
		return this._width;
	}
	
	set width(value) {
		this._width = value;
		this.body.style.width = "".concat(value, "px");
		this.textBody.style.width = this.body.style.width;
	}
	
	get height() {
		return this._height;
	}
	
	set height(value) {
		this._height = value;
		this.body.style.height = "".concat(value, "px");
		this.textBody.style.height = this.body.style.height;
	}
	
	delete() {
		this.textBody.remove();
		super.delete();
	}
}