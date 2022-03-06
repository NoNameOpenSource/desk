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

class DISwitch extends DIView {
	constructor(small, className, idName) {
		if(!className) {
			if(small)
				className='DISmallSwitch';
			else
				className='DISwitch';
		}
		super(className, idName);
		this.canHaveChild = false;
		this.event;
		this.switchBody = document.createElement('label');
		this.switchBody.appendChild(document.createElement('input'));
		this.switchBody.firstChild.setAttribute('type','checkbox');
		this.switchBody.appendChild(document.createElement('div'));
		if(small)
			this.switchBody.children[1].className = 'DISmallSwitchSlider';
		else
			this.switchBody.children[1].className = 'DISwitchSlider';
		this.body.appendChild(this.switchBody);
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
	
	setSwitchEvent(evt) {
		if(this.event)
			this.event.delete();
		this.event = new DeskEvent(this.switchBody.firstChild, "change", evt);
	}
	
	get value() {
		return this.switchBody.firstChild.checked;
	}
	
	set value(value) {
		this.switchBody.firstChild.checked = value;
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
		this.switchBody.remove();
		super.delete();
	}
}