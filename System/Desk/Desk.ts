/*
** 생성자
**
** -dataBaseType	: 데이터베이스로 사용될 프로그램의 종류
**		-MySQL	: 1
*/
var Desk = new function() {
	this.useHeader			= true;
	this.useNav				= false;
	this.useFooter			= false;
	this.useMultiWindows	= false;
	
	this.headerHeight		= 28;
	this.headerHide			= false;
	
	this.header;
	this.body;
	this.headerLogo;
	this.topMenu;
	
	this.windows			= new Array();
	this.windowsIndex		= 11;
	this.currentWindow;
	
	this.cursor;
	
	this.dragPointX;
	this.dragPointY;
	this.dragPointA;
	this.dragWindow;
	
	this.screenHeight;
	this.screenWidth;

	this.alerts 			= new Array();
	this.alertScreen
	
	this.init = function() {
		// Draw wallpaper
		this.wallpaper = new DIImageView('/System/Desk/Resources/Wallpaper/Blured/default.png', 'DIWallpaper');
		document.body.appendChild(this.wallpaper.body);
		
		//make views for each section
		this.header = new DIView(false, 'header');
		document.body.appendChild(this.header.body);
		// Init WorkSpace Dock
		this.workSpaceDock = new DIWorkSpaceDock('WorkSpaceDock');
		document.body.appendChild(this.workSpaceDock.body);
		this.workSpaceDock.didMoveToDesk();
		this.body = new DIView(false, 'body');
		document.body.appendChild(this.body.body);
		this.body.x = 64;
		this.body.y = 28;
		
		//draw logo
		this.headerLogo = new DIImageView("/System/Desk/Resources/EDUspaceLogoWhite.svg", false, 'headerLogo');
		this.header.addChildView(this.headerLogo);
		this.loadLogoAsInline();
		
		// Draw top menu
		this.initTopMenu();
		
		this.screenHeight = document.documentElement.clientHeight;
		this.screenWidth = document.documentElement.clientWidth;
		
		this.cursor=["auto","default","wait","pointer","text","vertical-text","copy","not-allowed","ns-resize","ew-resize"];
		
		// Init contextMenu
		this.contextMenu = new DIListView(this, this, 1, "DIContextMenu");
		this.contextMenu.cellHeight = 25;
		this.contextList = new Array();
		
		// Init canvas
		this.canvas = document.createElement('CANVAS');
		document.body.appendChild(this.canvas);
		this.canvas.style.display = "none";

		// Init desk menu
		this.initDeskMenu();

		// Init alert screen
		this.alertScreen = new DIView("DILoading");
		document.body.appendChild(this.alertScreen.body);
		this.alertScreen.hidden = true;
	}

	this.initTopMenu = function() {
		this.topMenu = new DIView(false, 'topMenu');
		this.header.addChildView(this.topMenu);
	}

	this.initDeskMenu = function() {
		this.deskMenu = new DeskMenu(this);
		this.deskMenu.width = 200;
		this.deskMenu.x = -1*this.deskMenu.width;
		this.deskMenu.y = 28;
		this.headerLogo.events.push(new DeskEvent(this.headerLogo.body, 'click', this.launchDeskMenu.bind(this)));
		document.body.appendChild(this.deskMenu.body);
	}

	this.hideTopMenuBar = function() {
		this.body.y = 0;
		this.workSpaceDock.y = 0;
		this.header.hidden = true;
	}

	this.hideWorkSpaceDock = function() {
		this.body.x = 0;
		this.workSpaceDock.hidden = true;
	}

	this.hideWallpaper = function() {
		this.wallpaper.hidden = true;
	}
	
	//	Context Menu
	this.showContextMenu = function(list, delegate, x, y) {
		this.contextList = list;
		this.contextMenu.delegate = delegate;
		this.contextMenu.reloadData();
		this.contextMenu.x = x - this.body.x + this.body.body.scrollLeft;
		this.contextMenu.y = y - this.body.y;
		if(this.contextEvent) {
			this.contextEvent.delete();
			this.contextEvent = null;
		}
		this.contextEvent = new DeskEvent(document.body, "mousedown", function(evt) {
			if(!((this.contextMenu.body.getBoundingClientRect().left <= evt.clientX && evt.clientX <= this.contextMenu.body.getBoundingClientRect().right) && (this.contextMenu.body.getBoundingClientRect().top <= evt.clientY && evt.clientY <= this.contextMenu.body.getBoundingClientRect().bottom))) {
				this.clearContextMenu();
			}
		}.bind(this));
		this.body.addChildView(this.contextMenu);
	}
	
	this.clearContextMenu = function() {
		if(this.contextEvent) {
			this.contextEvent.delete();
			this.contextEvent = null;
		}
		this.body.removeChildView(this.contextMenu);
	}
	
	this.numberOfRows = function(listView) {
		if(listView==this.contextMenu)
			return this.contextList.length;
	}

	this.cellAtRow = function(listView, row) {
		if(listView == this.contextMenu)  {
			var cell = new DIListViewCell("DIContextMenuCell");
			cell.name = new DILabel(this.contextList[row]);
			cell.addChildView(cell.name);
			return cell;
		}
		return false;
	}
	
	this.setUpContextMenu = function(body, delegate) {
		return new DeskEvent(body, "contextmenu", function(evt) {
			evt.preventDefault();
			var list = delegate.prepareContexMenu(body, evt.clientX, evt.clientY);
			if(list) {
				Desk.showContextMenu(list, delegate, evt.clientX, evt.clientY);
			}
		}.bind(this));
	}
	
	this.startDrag = function(clipboard, view, x, y, originalX, originalY) {
		var i = 0;
		for(;i<Secretary.mainWorkSpace.apps.length;i++) {
			if(Secretary.mainWorkSpace.apps[i].allowDrag) {
				Secretary.mainWorkSpace.apps[i].dragStart(clipboard);
			}
		}
		this.dragEnded = false;
		
		document.body.appendChild(view.body);
		view.body.style.zIndex = 100000;
		
		var difX = originalX - x;
		var difY = originalY - y;
		view.x = x + difX;
		view.y = y + difY;
		
		this.lastDragApp = null;
		this.currentDragApp = null;
		
		this.dragEvent = new DeskEvent(document.body, "mousemove", function(evt) {
			// find where the cursor is on
			if(evt.clientY < Desk.headerHeight) {
				// client on header
			} else {
				if(evt.clientX < this.body.x) {
					// client on dock
				} else {
					var i = 0;
					var app;
					for(;i<Secretary.mainWorkSpace.apps.length;i++) {
						app = Secretary.mainWorkSpace.apps[i];
						if(app.allowDrag) {
							if((app.window.x + this.body.x) < evt.clientX && (app.window.x + app.window.width + this.body.x) > evt.clientX) {
								app.dragOn(evt.clientX,evt.clientY);
							}
						}
					}
				}
			}
			view.x = evt.clientX + difX;
			view.y = evt.clientY + difY;
			if(this.currentDragApp != this.lastDragApp) {
				if(this.lastDragApp)
					this.lastDragApp.dragLeft();
			}
			this.lastDragApp = this.currentDragApp;
			this.currentDragApp = null;
		}.bind(this), false);
		this.dragEvent.target.addEventListener(this.dragEvent.method,this.dragEvent.evtFunc,true);
		
		this.dropEvent = new DeskEvent(document.body, "mouseup", function(evt) {
			// find where the cursor is on
			if(evt.clientY < Desk.headerHeight) {
				// client on header
			} else {
				if(evt.clientX < this.body.x) {
					// client on dock
				} else {
					var i = 0;
					var app;
					for(;i<Secretary.mainWorkSpace.apps.length;i++) {
						app = Secretary.mainWorkSpace.apps[i];
						if(app.allowDrag) {
							if((app.window.x + this.body.x) < evt.clientX && (app.window.x + app.window.width + this.body.x) > evt.clientX) {
								app.dragEnd(true, clipboard, evt.clientX,evt.clientY);
							} else {
								app.dragEnd(false);
							}
						}
					}
				}
			}
			
			// gap -m-
			
			if(!this.dragEnded) {
				// non of the apps captured the drag
				view.body.style.transition = "all .3s ease";
				view.x = originalX;
				view.y = originalY;
				setTimeout(function() {
					view.delete();
					view = null;
				}, 300);
			} else {
				view.delete();
				view = null;
			}
			this.lastDragApp = null;
			this.currentDragApp = null;
			
			this.dragEvent.target.removeEventListener(this.dragEvent.method,this.dragEvent.evtFunc, true);
			this.dragEvent.stopped = true;
			this.dragEvent.delete();
			this.dragEvent = null;
			this.dropEvent.target.removeEventListener(this.dropEvent.method,this.dropEvent.evtFunc, false);
			this.dropEvent.stopped = true;
			this.dropEvent.delete();
			this.dropEvent = null;
			
			this.dropEsc.delete();
			this.dropEsc = null;
		}.bind(this), false); // use bubbling instead of capturing
		this.dropEvent.target.addEventListener(this.dropEvent.method,this.dropEvent.evtFunc, false);
		
		this.dropEsc = new DeskEvent(window, "keydown", function(evt) {
			if(evt.keyCode == 27) { // esc
				if(this.currentDragApp != null)
					this.currentDragApp.dragLeft();
				if(this.currentDragApp != this.lastDragApp) {
					if(this.lastDragApp)
						this.lastDragApp.dragLeft();
				}
				var i = 0;
				var app;
				for(;i<Secretary.mainWorkSpace.apps.length;i++) {
					app = Secretary.mainWorkSpace.apps[i];
					if(app.allowDrag) {
						app.dragEnd(false);
					}
				}
				// canceling drag
				view.body.style.transition = "all .3s ease";
				view.x = originalX;
				view.y = originalY;
				setTimeout(function() {
					view.delete();
					view = null;
				}, 300);
				this.lastDragApp = null;
				this.currentDragApp = null;
				this.dragEvent.target.removeEventListener(this.dragEvent.method,this.dragEvent.evtFunc, true);
				this.dragEvent.stopped = true;
				this.dragEvent.delete();
				this.dragEvent = null;
				this.dropEvent.target.removeEventListener(this.dropEvent.method,this.dropEvent.evtFunc, false);
				this.dropEvent.stopped = true;
				this.dropEvent.delete();
				this.dropEvent = null;
				
				this.dropEsc.delete();
				this.dropEsc = null;
			}
		}.bind(this));
	}
	
	this.getIconOf = function(file) {
		if(file.type == 'mp4')
			return '/System/Secretary/Icon/video.png';
		else
			return '/System/Secretary/Icon/file.png';
	}
	
	//This belongs to old UI
	/*
	
	this.addWindow = function(window, x=0, y=0) {
		window.x = x;
		window.y = y;
		this.body.body.appendChild(window.body);
		window.didMoveToDesk();
		this.bringWindowFront(window);
	}
	
	this.addWindowAtTheEnd = function() {
	}
	
	this.addWindowAtCenter = function(window) {
		var x = this.body.body.offsetWidth/2;
		var y = this.body.body.offsetHeight/2;
		this.body.body.appendChild(window.body);
		window.didMoveToDesk();
		this.bringWindowFront(window);
		window.x= x - window.width/2;
		window.y= y - window.height/2;
	}
	*/
	
	// This belongs to old UI
	/*
	this.beginWindowDrag = function(window, initX, initY) {
		this.dragPointX = initX - window.x;
		this.dragPointY = initY + window.y;
		this.dragPointA = initY - this.screenHeight + window.y + window.height + window.titleBar.height;
		this.dragWindow = window;
		document.addEventListener("mousemove",Desk.doWindowDrag, true);
		document.addEventListener("mouseup",Desk.endWindowDrag, true);
		document.documentElement.style.cursor="default";
	}
	*/
	
	// This belongs to old UI
	/*
	this.doWindowDrag = function(evt) {
		var newY = evt.clientY;
		if(evt.clientY - Desk.dragPointA < Desk.headerHeight)
			newY = Desk.headerHeight + Desk.dragPointA;
		// Move the window
		Desk.dragWindow.x = evt.clientX - Desk.dragPointX;
		Desk.dragWindow.y = Desk.dragPointY - newY;
		// For debug purpose
		//Desk.testWindow.child.stringValue="  X : ".concat(evt.clientX,", Y : ",evt.clientY);
	}
	*/
	
	// This belongs to old UI
	/*
	this.endWindowDrag = function(evt) {
		document.removeEventListener("mousemove",Desk.doWindowDrag, true);
		document.documentElement.style.cursor="";
		Desk.dragWindow = null;
		document.removeEventListener("mouseup",Desk.endWindowDrag, true);
	}
	*/
	
	this.closeWindow = function(window) {
		if(window == Desk.currentWindow)
			Desk.currentWindow = null;
		window.delete();
		window = null;
	}
	
	this.bringWindowFront = function(window) {
		if(window.deleted)
			return false;
		if(window == Desk.currentWindow)
			return false;
		if(Desk.currentWindow && !Desk.currentWindow.deleted)
			Desk.currentWindow.putInSleep();
		window.z = Desk.windowsIndex;
		Desk.windowsIndex+=1;
		Desk.currentWindow = window;
		Desk.currentWindow.wakeUp();
		//Desk.testWindow.child.stringValue="window title: ".concat(window.title);
	}
	
	this.getFontHeight = function(font, size) {
		var span = document.createElement('SPAN');
		document.body.appendChild(span);
		span.textContent = 'a';
		span.style.fontFamily = font;
		span.style.fontSize = size;
		var height = span.offsetHeight;
		span.remove();
		return height;
	}
	
	this.addPluginFrame = function(frame) {
		frame.style.display = "none";
		document.body.appendChild(frame);
	}

	this.loadLogoAsInline = function() { // load logo as inline svg file
		var ajax = new XMLHttpRequest();
		ajax.open("GET", this.headerLogo.imageSource);
		ajax.addEventListener('load', function(evt) {
			this.headerLogo.imageBody.remove();
			this.headerLogo.imageBody = document.createElement('SVG');
			this.headerLogo.body.appendChild(this.headerLogo.imageBody);
			//var str = evt.target.responseText.substr(evt.target.responseText.indexOf('<svg'));
			//this.headerLogo.imageBody.outerHTML = str;
			this.headerLogo.imageBody.outerHTML = evt.target.responseText;
			this.headerLogo.imageBody = this.headerLogo.body.children[0];
		}.bind(this));
		ajax.send();
	}

	this.alertError = function(titleText, errorMsg, func) {
		this.alertScreen.hidden = false;
		var alert = new DIAlertView(titleText, false, "DIAlertView");
		alert.useTextArea(errorMsg);
		this.alerts.push(alert);
		alert.events.push(new DeskEvent(window.body, 'keydown',function(evt) {
			if(evt.keyCode==13) { // enter key
				alert.buttons[alert.buttons.length - 1].buttonBody.click();
			} else if(evt.keyCode == 27) { // esc
				alert.buttons[0].buttonBody.click();
			}
			evt.stopPropagate();
		}.bind(this)));
		alert.addButton("Ok", function() {
			var i = this.alerts.indexOf(alert);
			this.alerts[i] = null;
			this.alerts.splice(i, 1);
			alert.delete();
			alert = null;
			if(this.alerts.length < 1)
				this.alertScreen.hidden = true;
			if(func)
				func();
		}.bind(this));
		document.body.appendChild(alert.body);
		alert.didMoveToDesk();
		alert.body.style.top = "calc(50% - ".concat(alert.height/2, "px)");
		alert.body.style.left = "calc(50% - ".concat(alert.width/2, "px)");
	}

	this.launchDeskMenu = function() {
		if(!this.deskMenu.active) {
			this.body.x += this.deskMenu.width;
			this.workSpaceDock.x += this.deskMenu.width;
			this.deskMenu.x += this.deskMenu.width;
			this.headerLogo.body.style.background = "#FFF";
			this.headerLogo.imageBody.style.fill = "#000";
			this.headerLogo.imageBody.style.stroke = "#000";
			this.deskMenu.active = true;
		} else {
			this.body.x -= this.deskMenu.width;
			this.workSpaceDock.x -= this.deskMenu.width;
			this.deskMenu.x -= this.deskMenu.width;
			this.headerLogo.body.style.background = "";
			this.headerLogo.imageBody.style.fill = "";
			this.headerLogo.imageBody.style.stroke = "";
			this.deskMenu.active = false;
		}
	}

	this.getDeskUI = Object.freeze({
		"CloseButton" : "/System/Desk/Resources/DICloseButton.svg",
		"MinimizeButton" : "/System/Desk/Resources/DIMinimizeButton.svg",
		"MaximizeButton" : "/System/Desk/Resources/DIMaximizeButton.svg",
		"SettingButton" : "/System/Desk/Resources/DISettingButton.svg",
		"BackButton" : "/System/Desk/Resources/DIBackButton.svg",
		"AddButton" : "/System/Desk/Resources/DIAddButton.svg",
		"UploadButton" : "/System/Desk/Resources/DIUploadButton.svg",
		"SearchIcon" : "/System/Desk/Resources/DISearch.svg",
		"SaveIcon" : "/System/Desk/Resources/DISave.svg",
		"ComboBoxArrow" : "/System/Desk/Resources/DIComboBoxArrow.svg",
		"PlayButton" : "/System/Desk/Resources/DIPlayButton.svg",
		"PauseButton" : "/System/Desk/Resources/DIPauseButton.svg",
		"FullScreenButton" : "/System/Desk/Resources/DIFullScreenButton.svg"
	})
}