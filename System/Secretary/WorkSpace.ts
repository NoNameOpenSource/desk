
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

class WorkSpace {
	constructor(spaceName, iconName, appList, appSettings) {
		this.name = spaceName;
		this.icon = new DIImageView(iconName, "WorkSpaceIcon");
		this.appSettings = new DIImageView(iconName, "WorkSpaceIcon");
		this.appList = appList;
		this.apps = new Array();
		this.data = new Object();
		this.body = new DIView("WorkSpace");
		this.loaded = false;
		this.appSettings = appSettings;
		this.width = 10;
		this.body.width = this.width;
	}
	
	initApps() {
		var i = 0;
		for(;i<this.appList.length;i++) {
			
		}
	}
	
	wakeUp() {
		if(!this.loaded) {
			this.loadApps();
			this.loaded = true;
			this.loadedMark = document.createElement('DIView');
			this.loadedMark.className= "WorkSpaceIconMark";
			this.icon.body.appendChild(this.loadedMark);
		} else {
			var i = 0;
			for(;i<this.apps.length;i++) {
				this.apps[i].wakeUp();
			}
		}
	}
	
	putInSleep() {
		var i = 0;
		for(;i<this.apps.length;i++) {
			this.apps[i].putInSleep();
		}
	}
	
	loadApps() {
		var i = 0;
		for(;i<this.appList.length;i++) {
			this.loadApp(this.appList[i], this.appSettings[i])
		}
	}

	loadApp(name, setting) {
		var i = this.apps.push(Secretary.loadApp(name, setting, this)) - 1;
		this.addWindow(this.apps[i].window);
		this.apps[i].data = this.data;
		this.apps[i].workSpace = this;
		if(this.apps[i].didMoveToDesk)
			this.apps[i].didMoveToDesk();
		this.apps[i].window.didMoveToDesk();
		if(this.apps[i].resizable){
			var app = this.apps[i];
			app.rightBorder = new DIView();
			app.rightBorder.body.style.height = "100%";
			app.rightBorder.body.style.width = "10px";
			app.rightBorder.x = app.window.x + app.window.width;
			app.rightBorder.body.style.cursor = "ew-resize";
			this.body.addChildView(this.apps[i].rightBorder);
			app.rightBorder.body.app = app;
			app.rightBorder.events.push(new DeskEvent(app.rightBorder.body, "mousedown", function(evt){
				if(evt.button == 0) {
					evt.preventDefault();
					this.resizeWindow(evt.target.app, evt);
				}
			}.bind(this)));
		}
	}
	
	setContextMenu(dataSource, delegate) {
		if(this.contextMenu) {
		}
	}

	fullScreen(window) {
		window.x = 0;
		window.titleBar.hidden = true;
		window.width = this.body.body.getBoundingClientRect().width;
	}
	
	addWindow(window) {
		window.y = 0;
		window.x = this.width;
		this.width += window.width + 10; // 1 is for the border
		this.body.addChildView(window);
		this.body.width = this.width;
	}
	
	resizeWindow(app, evt) {
		if(app.window.minButton.hidden) {
			// window is minimized
			return
		}
		var index = this.apps.indexOf(app) + 1;
		var diff = app.rightBorder.body.getBoundingClientRect().left - evt.clientX;
		this.lastWidth = app.window.width;
		var i = index;
		for(;i<this.apps.length;i++) {
			this.apps[i].window.body.style.transition = "none";
		}
		app.resizeStart();
		this.resizeEvent = new DeskEvent(document, 'mousemove', function(evt) {
			var width = app.resizeWidth(Desk.body.body.scrollLeft + evt.clientX - Desk.body.x - app.window.x + diff);
			if(width != false) {
				var change = this.lastWidth - width;
				var i = index;
				for(;i<this.apps.length;i++) {
					this.apps[i].window.x -= change;
					if(this.apps[i].resizable) {
						this.apps[i].rightBorder.x -= change;
					}
				}
				this.width += change;
				this.body.width +=change;
				this.lastWidth = width;
			}
		}.bind(this));
		this.resizeEnd = new DeskEvent(window, 'mouseup', function(evt) {
			this.resizeEvent.evtFunc(evt);
			this.resizeEvent.delete();
			app.resizeEnd();
			app.rightBorder.x = app.window.x + app.window.width;
			var i = index;
			for(;i<this.apps.length;i++) {
				this.apps[i].window.body.style.transition = "";
			}
			this.resizeEnd.delete();
			this.resizeEvent = null;
			this.resizeEnd = null;
		}.bind(this));
	}
	
	dataUpdated(str, data, sender) {
		if(str) {
			var i = 0;
			for(;i<this.apps.length;i++) {
				if(this.apps[i].dataUpdated)
					this.apps[i].dataUpdated(str, data, sender);
			}
		} else {
			var i = 0;
			for(;i<this.apps.length;i++) {
				if(this.apps[i].dataUpdated)
					this.apps[i].dataUpdated();
			}
		}
	}
	
	updateWindows() {
		var currentLen = 10;
		var i = 0;
		for(;i<this.apps.length;i++) {
			this.apps[i].window.x = currentLen;
			currentLen += this.apps[i].window.width + 10;
			if(this.apps[i].resizable) {
				this.apps[i].rightBorder.x = currentLen - 10;
			}
		}
		this.body.width = currentLen;
		this.width = currentLen;
	}

	appWillClose(app) {
	}

	appDidClose(app) {
		// check if the application have right boarder
		if(app.rightBorder) {
			app.rightBorder.body.app = null;
			app.rightBorder.delete();
		}
		let index = this.apps.indexOf(app);
		if(index != -1) {
			this.apps[index] = null;
			this.apps.splice(index, 1);
			this.body.children.splice(index, 1);
		}
		this.updateWindows();
	}
	
	delete() {
		var i = 0;
		for(;i<this.apps.length;i++) {
			this.apps[i].delete();
		}
		this.apps.length = 0;
		this.body.children.length = 0;
		this.body.delete();
		this.icon.delete();
	}
}