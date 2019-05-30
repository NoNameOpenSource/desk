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

class DIWindow {
	constructor(className, idName, title, x, y, width, height, titleBarOptions=0) {
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
		this.titleSize = 26;
		
		this.tmp;
		
		this.body = document.createElement('DIWindow');
		if(className)
			this.body.className = className;
		if(idName)
			this.body.id = idName;
		//this.events.push(new DeskEvent(this.body, "mousemove", this.mouseMove.bind(this), false));
		// TitleBar Initialization
		if(titleBarOptions<5) {
			this.titleBar = new DIView('DIWindowTitleBar');
			this.titleBar.height = this.titleSize;
			this.body.appendChild(this.titleBar.body)
			this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
			// Add title to titleBar
			if(titleBarOptions<3) {
				this.titleField = new DILabel(title, 'DIWindowTitle');
				this.titleBar.addChildView(this.titleField);
				if(titleBarOptions<2) {
					this.closeButton = new DIImageView(Desk.getDeskUI["CloseButton"], 'DIWindowButton');
					this.closeButton.events.push(new DeskEvent(this.closeButton.imageBody, 'click', this.close.bind(this)))
					this.titleBar.addChildView(this.closeButton);
					if(titleBarOptions<1) {
						this.minButton = new DIImageView(Desk.getDeskUI["MinimizeButton"], 'DIWindowButton');
						this.minButton.x = this.titleSize;
						this.titleBar.addChildView(this.minButton);
						this.minButton.events.push(new DeskEvent(this.minButton.imageBody, 'click', this.minimize.bind(this)));
						this.maxButton = new DIImageView(Desk.getDeskUI["MaximizeButton"], 'DIWindowButton');
						this.maxButton.y = this.titleSize;
						this.titleBar.addChildView(this.maxButton);
						this.maxButton.hidden = true;
						this.minButton.events.push(new DeskEvent(this.maxButton.imageBody, 'click', this.maximize.bind(this)));
					}
				}
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

	setUpToolBar(toolbar) {
		if(!toolbar) {
			toolbar = new DIToolbar();
		}
		this.toolbar = toolbar;
		this.toolbar.y = this.titleSize;
		if(this.child)
			child.y += this.toolbar.height;
		this.body.appendChild(toolbar.body);
	}
	
	mouseDown(evt){
		//if(evt.button == 0) { // If primary button
			// Convert coord.
			var x=evt.clientX-this.x;
			var y=evt.clientY-this.y-28;
			Desk.bringWindowFront(this);
			if(this.resize&&(x<5||x>this.width-5)) { // Resizing window in X
			} else if(y<20) { // TitleBar got clicked
				evt.preventDefault(); // Disable text selection
				//!-----------
				//Desk.beginWindowDrag(this, evt.clientX, evt.clientY);
        		return false; // Disable text selection
			}
		//}
	}
	
	minimize() {
		this.regWidth = this.width;
		this.width = this.titleSize;
		this.titleBar.body.style.height = "100%";
		this.minButton.hidden = true;
		this.maxButton.hidden = false;
		this.titleField.y = 49;
		this.titleField.x = this.titleSize / 2;
		this.titleField.textBody.style.width = "".concat(this.body.clientHeight - 62, "px");
		this.titleField.textBody.style.textAlign = "left";
		this.titleField.textBody.style.transform = "rotate(90deg)";
		if(this.app.windowMinimized)
			this.app.windowMinimized();
		if(this.child) {
			this.child.putInSleep();
			this.body.removeChild(this.child.body);
		}
		Secretary.mainWorkSpace.updateWindows();
	}
	
	maximize() {
		this.width = this.regWidth;
		this.titleBar.height = this.titleSize;
		this.minButton.hidden = false;
		this.maxButton.hidden = true;
		this.titleField.y = 0;
		this.titleField.body.style.left = "";
		this.titleField.textBody.style.width = "";
		this.titleField.textBody.style.textAlign = "";
		this.titleField.textBody.style.transform = "";
		if(this.app && this.app.windowMaximized)
			this.app.windowMaximized();
		if(this.child) {
			this.body.appendChild(this.child.body);
			this.child.wakeUp();
		}
		Secretary.mainWorkSpace.updateWindows();
	}
	
	changeCursor(cursor) {
		if(cursor==this.cursor)
			return false;
		this.body.style.setProperty("cursor",Desk.cursor[cursor],"important");
		this.cursor=cursor;
	}
	
	setChildView(child) {
		this.child = child;
		this.body.appendChild(child.body);
		child.parent = this;
		child.didMoveToParent();
		child.x = 0;
		child.y = this.titleSize;
		if(this.toolbar)
			child.y += this.toolbar.height;
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
		if(this.toolbar) {
			this.toolbar.didMoveToDesk();
		}
		if(this.child){
			this.child.didMoveToDesk();
		}
	}
	
	putInSleep() {
		//if(this.events[0])
		//	this.events[0].stop();
		this.body.style.cursor = "default";
		this.inSleep = true;
		this.child.putInSleep();
	}
	
	wakeUp() {
		//if(this.events[0])
		//	this.events[0].resume();
		this.body.style.cursor = "";
		this.child.wakeUp();
		this.inSleep = false;
	}
	
	get x() {
		return this._x;
	}
	
	set x(value) {
		/*
		if(value<20-this.width)
			value=20-this.width;
		if(value>Desk.screenWidth-20)
			value=Desk.screenWidth-20;
			*/
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
		this.body.style.width = "".concat(value, "px");
	}
	
	get height() {
		return this._height;
	}
	
	set height(value) {
		this._height = value;
		if(this.child)
			this.child.height = value;
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
		if(this.app)
			this.app.windowWillClose(this);
		if(!this.deleted)
			this.delete();
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
		this.child = null;
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