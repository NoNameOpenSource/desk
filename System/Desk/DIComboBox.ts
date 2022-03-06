/*
** Class	: DIComboBox
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

class DIComboBox extends DITextField {
	constructor(className, idName) {
		if(!className)
			className='DITextField';
		super(false,true,className, idName);
		this.items=new Array();
		this.searchedItems=new Array();
		
		this.deleteKey=true;
		
		this.oldString = "";
	}
	
	keyDown(evt) {
		if(evt.keyCode==8 || evt.keyCode==42)
			this.deleteKey=true;
		else
			this.deleteKey=false;
	}
	
	searchHints() {
		if(this.oldString==this.stringValue || this.deleteKey)
			return
		else
			this.oldString=this.stringValue;
		this.searchedItems.length=0;
		var i;
		for(i=0;i<this.items.length;i++) {
			if(this.items[i].indexOf(this.stringValue) === 0) {
				var start = this.stringValue.length;
				this.stringValue=this.items[i];
				this.textBody.setSelectionRange(start,this.items[i].length);
				this.searchedItems.push(this.items[i]);
			}
		}
		for(;i<this.items.length;i++) {
			if(this.items[i].indexOf(this.stringValue) === 0) {
				this.searchedItems.push(this.items[i]);
			}
		}
	}
	
	addItem(item) {
		if(this.useDataSource) {
		}
		else {
			this.items.push(item);
		}
	}
	
	addItems() {
		for(var i=0;i<arguments.length;i++)
			this.addItem(arguments[i]);
	}
	
	didMoveToDesk() {
		this._width = this.body.offsetWidth;
		this._height = this.body.offsetHeight;
		this.events.push(new DeskEvent(this.textBody, "keydown", this.keyDown.bind(this)));
		this.events.push(new DeskEvent(this.textBody, "input", this.searchHints.bind(this)));
	}
	
}