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

class DIButton extends DIView {
	constructor(text, className, idName) {
		if(!className)
			className='DIButton';
		super(className, idName);
		this.canHaveChild = false;
		this.event;
		this.buttonBody = document.createElement('button');
		if(text)
			this.buttonBody.textContent = text;
		this.body.appendChild(this.buttonBody);
		this._width = 290;
	}
	
	putInSleep() {
		//if(this.event)
		//	this.event.stop();
		super.putInSleep();
	}
	
	wakeUp() {
		//if(this.event)
		//	this.event.resume();
		super.wakeUp();
	}
	
	setButtonEvent(evt) {
		if(this.event)
			this.event.delete();
		this.event = new DeskEvent(this.buttonBody, "click", evt);
	}
	
	get stringValue() {
		return this.buttonBody.textContent;
	}
	
	set stringValue(value) {
		this.buttonBody.textContent = value;
	}
	
	get width() {
		return _width;
	}
	
	set width(value) {
		this._width = value;
		this.buttonBody.style.width = "".concat(value, "px");
	}
	
	delete() {
		// Remove EventListener
		if(this.event) {
			this.event.delete();
			this.event = null;
		}
		this.buttonBody.remove();
		super.delete();
	}
}