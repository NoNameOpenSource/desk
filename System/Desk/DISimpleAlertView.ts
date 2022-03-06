/*
** Class	: DIAlertView
** 
** Sample alert for the system
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DISimpleAlertView extends DIView {
	constructor(text, icon, className, idName) {
		if(!className)
			className='DISmallAlertView';
		super(className, idName);
		this.buttons = new Array();
		// Add alert content
		this.alertContent = new DILabel("", 'DIAlertViewContent');
		if(text)
			this.alertContent.stringValue = text;
		this.addChildView(this.alertContent);
		this.autoHeight = true;
		if(icon) {
			this.icon = new DIImageView(icon, 'DIAlertViewIcon');
			this.addChildView(this.icon);
		}
		this._useTextArea = false;
	}
	
	get stringValue() {
		return this.alertContent.stringValue;
	}
	
	set stringValue(value) {
		this.alertContent.stringValue = value;
	}
	
	useTextArea(text) {
		if(!this._useTextArea) {
			this.textArea = new DIView('DIAlertViewTextArea');
			this.textArea.textBody = document.createElement('DIV');
			this.textArea.textBody.innerHTML = text;
			this.textArea.body.appendChild(this.textArea.textBody);
			this.addChildView(this.textArea);
			this._useTextArea = true;
		}
	}
	
	addButton(text, evt) {
		var id = this.buttons.length;
		this.buttons.push(new DIButton(text, 'DISmallAlertViewButton'));
		this.buttons[id].body.style.width = "50%";
		//this.buttons[id].y = 10;
		this.buttons[id].setButtonEvent(evt);
		this.addChildView(this.buttons[id]);
		return id;
	}
	
	didMoveToDesk() {
		if(this.autoHeight) {
			var height;
			if(this._useTextArea)
				this.height = this.alertContent.body.offsetHeight + 239;
			else
				this.height = this.alertContent.body.offsetHeight + 39;
		}
		this.buttons[0].x = 0;
		this.buttons[0].y = this.height - 33;
		this.buttons[1].x = this.width/2;
		this.buttons[1].y = this.height - 33;
	}
	
	delete() {
		//for(var i = 0; i < this.buttons.length; i++) {
		//	this.buttons[i].delete();
		//}
		this.alertContent = null;
		this.icon = null;
		this.buttons.length = 0;
		this.buttons = null;
		//this.alertContent.delete();
		super.delete();
	}
}