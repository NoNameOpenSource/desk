/*
** Class	: Application
** 
** This class is for the Applications that will run on 'Desk System'
**
** Application gets loaded from Secretary Class
** 
** properties
** 	-appId			: Similar to Widnows` PID, it determinates which app this is from other apps, running.
**	-appName		: Name of the Application
**	-appType		: Type of the Application
**		-null	: -1
**		-GUIapp	: 1
**		-Widget	: 2
**		-noGUI	: 3
**	-appBody		:Body of the Application. This is Highest HTML Elements of GUI of this app.
**
*/
class Application {
	constructor(workSpace, appName, windowClass, resizable) {
		this.workSpace = workSpace;
		this.data = workSpace.data;
		this.window = new DIWindow(windowClass, false, appName, resizable);
		this.window.app = this;
		
		// Init alert layer
		this.alerts = new Array();
		this.alertScreen = new DIView("DILoading");
		this.alertScreen.body.style.zIndex = 100;
		this.alertScreen.hidden = true;
		//this._loading = true;
		
		// Init loading layer
		this.loadingScreen = new DIView("DILoading");
		this.loadingAnimation = new DIView("loading");
		this.loadingAnimation.width = 112;
		this.loadingAnimation.height = 112;
		this.loadingAnimation.body.style.left = "calc(50% - 64px)";
		this.loadingAnimation.body.style.top = "calc(50% - 64px)";
		
		this.animations = new Array();
		
		if(resizable) {
			this.resizable = true;
		}
	}
	
	init() {
		this.AppDelegate.init(this);
	}
	
	didMoveToDesk() {
		if(this.window.child.view) {
			this.window.child.view.addChildView(this.alertScreen);
			this.window.child.view.addChildView(this.loadingScreen);
			this.window.child.view.addChildView(this.loadingAnimation);
		} else {
			this.window.child.addChildView(this.alertScreen);
			this.window.child.addChildView(this.loadingScreen);
			this.window.child.addChildView(this.loadingAnimation);
		}
		if(this._loading === undefined) {
			this._loading = true;
			this.loading = false;
		}
	}
	
	alert(text, func, className) {
		this.alertScreen.hidden = false;
		var alert;
		if(this.window.width < 330)
			alert = new DISmallAlertView(text, false, className);
		else
			alert = new DIAlertView(text, false, className);
		this.alerts.push(alert);
		if(this.window.width > 500) {
			alert.body.style.left = "calc(50% - 230px)";
		}
		alert.events.push(new DeskEvent(window, "keydown", function(evt) {
			if(evt.keyCode == 13) { // enter key
				alert.buttons[alert.buttons.length - 1].buttonBody.click();
			} else if(evt.keyCode == 27) { // esc
				alert.buttons[0].buttonBody.click();
			}
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
		if(this.window.child.view)
			this.window.child.view.addChildView(alert);
		else
			this.window.child.addChildView(alert);
		alert.body.style.top = "calc(50% - ".concat(alert.height/2, "px)");
		return alert;
	}
	
	alertSimple(text, frstTitle, scndTitle, frstFunc, scndFunc, className) {
		this.alertScreen.hidden = false;
		var alert;
		if(this.window.width < 330) {
			alert = new DISimpleAlertView(text, false, className);
			this.alerts.push(alert);
			alert.events.push(new DeskEvent(window, "keydown", function(evt) {
				if(evt.keyCode == 13) { // enter key
					alert.buttons[alert.buttons.length - 1].buttonBody.click();
				} else if(evt.keyCode == 27) { // esc
					alert.buttons[0].buttonBody.click();
				}
			}.bind(this)));
			alert.addButton(frstTitle, function() {
				var i = this.alerts.indexOf(alert);
				this.alerts[i] = null;
				this.alerts.splice(i, 1);
				alert.delete();
				alert = null;
				if(this.alerts.length < 1)
					this.alertScreen.hidden = true;
				if(frstFunc)
					frstFunc();
			}.bind(this));
			alert.addButton(scndTitle, function() {
				var i = this.alerts.indexOf(alert);
				this.alerts[i] = null;
				this.alerts.splice(i, 1);
				alert.delete();
				alert = null;
				if(this.alerts.length < 1)
					this.alertScreen.hidden = true;
				if(scndFunc)
					scndFunc();
			}.bind(this));
			this.window.child.addChildView(alert);
			alert.body.style.top = "calc(50% - ".concat(alert.height/2, "px)");
			return alert;
		}
	}
	
	alertError(titleText, errorMsg, func, className) {
		this.alertScreen.hidden = false;
		var alert = new DIAlertView(titleText, false, className);
		if(errorMsg)
			alert.useTextArea(errorMsg);
		this.alerts.push(alert);
		alert.events.push(new DeskEvent(this.window.child.body, 'keydown',function(evt) {
			if(evt.keyCode==13) { // enter key
				alert.buttons[alert.buttons.length - 1].buttonBody.click();
			} else if(evt.keyCode == 27) { // esc
				alert.buttons[0].buttonBody.click();
			}
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
		this.window.child.addChildView(alert);
		alert.body.style.top = "calc(50% - ".concat(alert.height/2, "px)");
	}
	
	resizeStart() {}
	
	resizeEnd() {}
	
	resizeWidth(width) {
		if(width < this.minWidth)
			width = this.minWidth;
		if(width == this.window.width)
			return false;
		this.window.width = width;
		return width;
	}
	
	activate() {
	}
	
	deactivate() {
		
	}
	
	beginAnimation(animation) {
		this.ainmations.push(animation);
	}
	
	// stopping animations is possible through the DeskAnimation. Not needed here. ...probably
	
	endAnimation(animation) {
		var i = this.animations.indexOf(animation);
		animation.delete();
		this.animations[i] = null;
		this.animations.splice(i, 1);
	}

	windowWillClose(window) {
		if(window == this.window) {
			// main window
		}
	}

	windowDidClose(window) {
		if(window == this.window) {
			// main window
			this.delete()
		}
	}
	
	get loading() {
		return this._loading;
	}
	
	set loading(value) {
		if(!this._loading && value) {
			this.loadingScreen.hidden = false;
			this.loadingAnimation.hidden = false;
			this._loading = true;
		} else if(this._loading && !value) {
			this.loadingScreen.hidden = true;
			this.loadingAnimation.hidden = true;
			this._loading = false;
		}
	}
	
	delete() {
		this.workSpace.appWillClose(this);
		this.deleted = true
		if(!this.window.deleted)
			this.window.delete();
		if(this.alerts.length>0) {
			var i = 0;
			for(;i<this.alerts.length;i++) {
				this.alerts[i].delete();
			}
		}
		this.workSpace.appDidClose(this);
		this.workSpace = null;
	}
}