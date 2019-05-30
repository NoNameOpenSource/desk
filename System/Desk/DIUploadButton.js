/*
** Class	: DIButton
** 
** This is simple button for the system
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DIUploadButton extends DIButton {
	constructor(text, className, idName) {
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