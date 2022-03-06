/*
** Class	: DIWindow
** 
** Window class for the system
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DIResizableWindow {
	constructor(className, idName, title, x, y, width, height, titleBarOptions=1) {
		this.child;
		this.parent;
		this.events=new Array();
		this._x=0;
		this._y=0;
		this._z=0;
		this._width=0;
		this._height=0;
		this.deleted = false;
		this.resize=true;
		this.cursor=0;
		
		this.tmp;
		
		this.body = document.createElement('DIWindowBorder');
		this.body.appendChild(document.createElement('DIWindow'));
		this.body.childNodes[0].style.bottom="5px";
		this.body.childNodes[0].style.left="5px";
		if(className)
			this.body.className = className;
		if(idName)
			this.body.id = idName;
		//this.events.push(new DeskEvent(this.body, "mousemove", this.mouseMove.bind(this), false));
		// TitleBar Initialization
		if(titleBarOptions<5) {
			this.titleBar = new DIView('DIWindowTitleBar');
			this.titleBar.height = 20;
			this.body.childNodes[0].appendChild(this.titleBar.body)
			this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
			// Add title to titleBar
			if(titleBarOptions<3) {
				this.titleField = new DILabel(false, 'DIWindowTitle');
				this.titleBar.addChildView(this.titleField);
			}
		}
		if(title)
			this.title = title;
		if(x)
			this.x = x;
		if(y)
			this.y = y;
		if(width)
			this.width = width;
		if(height)
			this.height = height;
		if(titleBarOptions)
			this.titleBarOptions = titleBarOptions;
	}
	
	mouseDown(evt){
		if(evt.button == 0) { // If primary button
			// Convert coord.
			var x=evt.clientX-this.x;
			var y=Desk.screenHeight-evt.clientY-this.y;
			Desk.bringWindowFront(this);
			if(this.resize&&(x<5||x>this.width-5)) { // Resizing window in X
			} else if(this.height-y<0) { // TitleBar got clicked
				evt.preventDefault(); // Disable text selection
				Desk.beginWindowDrag(this, evt.clientX, evt.clientY);
        		return false; // Disable text selection
			}
		}
	}
	
	changeCursor(cursor) {
		if(cursor==this.cursor)
			return false;
		this.body.style.setProperty("cursor",Desk.cursor[cursor],"important");
		this.cursor=cursor;
	}
	
	setChildView(child) {
		this.child = child;
		this.body.childNodes[0].appendChild(child.body);
		child.parent = this;
		child.didMoveToParent();
		child.x = 0;
		child.y = 0;
		return true;
	}
	
	removeChildView(child) {
		if(this.child == child)
			this.child = null;
		else
			return false;
		return true;
	}
	
	didMoveToParent() {
	}
	
	didMoveToDesk() {
		if(this.child){
			this.child.didMoveToDesk();
			if(this.width==0)
				this.width = this.child.width;
			else
				this.child.width = this.width;
			if(this.height==0)
				this.height = this.child.height;
			else
				this.child.height = this.height;
		}
		// Make window border
		this.border=new Array();
		for(var i=0;i<4;i++) {
			this.border.push(document.createElement('DIWindowBorder'));
			this.border[i].className="DIWindowBorder".concat(i);
			this.body.childNodes[0].appendChild(this.border[i]);
		}
	}
	
	putInSleep() {
		//if(this.events[0])
		//	this.events[0].stop();
		this.body.style.cursor = "default";
		this.child.putInSleep();
	}
	
	wakeUp() {
		//if(this.events[0])
		//	this.events[0].resume();
		this.body.style.cursor = "";
		this.child.wakeUp();
	}
	
	get background() {
		return this.body.childNodes[0].style.background;
	}
	
	set background(value) {
		this.body.childNodes[0].style.background=value;
	}
	
	get x() {
		return this._x;
	}
	
	set x(value) {
		if(value<20-this.width)
			value=20-this.width;
		if(value>Desk.screenWidth-20)
			value=Desk.screenWidth-20;
		this._x = value;
		this.body.style.left = "".concat(value, "px");
	}
	
	get y() {
		return this._y;
	}
	
	set y(value) {
		if(value<-this.height)
			value = -this.height;
		this._y = value;
		this.body.style.bottom = "".concat(value, "px");
	}
	
	get z() {
		return this._z;
	}
	
	set z(value) {
		this._z = value;
		if(this.body)
			this.body.style.zIndex = value;
	}
	
	get width() {
		return this._width;
	}
	
	set width(value) {
		this._width = value;
		this.titleBar.width = value;
		if(this.child)
			this.child.width = value;
		this.body.childNodes[0].style.width = "".concat(value, "px");
		value+=10;
		this.body.style.width = "".concat(value, "px");
	}
	
	get height() {
		return this._height;
	}
	
	set height(value) {
		this._height = value;
		if(this.child)
			this.child.height = value;
		this.body.childNodes[0].style.height = "".concat((value+this.titleBar.height), "px");
		value+=10;
		this.body.style.height = "".concat((value+this.titleBar.height), "px");
	}
	
	get title() {
		return this._title;
	}
	
	set title(value) {
		this._title = value;
		if(this.titleBarOptions<3) {
			this.titleField.stringValue = value;
		}
	}
	
	close() {
		this.parent.closeWindow(this);
	}
	
	delete() {
		this.deleted = true;
		this.closeButton = null;
		this.minButton = null;
		this.maxButton = null;
		this.titleField = null;
		if(this.titleBar) {
			this.titleBar.delete();
			this.titleBar = null;
		}
		for(var i=0; i<this.events.length; i++)
			this.events[i].delete();
		this.events.length=0;
		this.child.delete();
		this.body.remove();
		this.body = null;
		if(this.parent)
			this.parent = null;
		if(this.app && !this.app.deleted) {
			this.app.windowDidClose(this);
			this.app = null;
		}
	}
}