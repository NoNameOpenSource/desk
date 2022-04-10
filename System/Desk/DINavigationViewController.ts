/*
** Class	: DINavigationViewController
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

class DINavigationViewController extends DIViewController {
	constructor(className, idName, delegate) {
		if(!className)
			className='DINavigationViewController';
		super(new DIView());
		// Setting up navigation bar(view)
		this.navigationView = new DIView();
		this.view.addChildView(this.navigationView);
		this._currentView;
		this.backwardButton = new DIView();
		this.titleField = new DITextLabel();
		this.navigationView.addChildView(this.backwardButton);
		this.backwardButton.events.push(new DeskEvent(this.backwardButton.body, "onclick", this.backButtonTriggered.bind(this)));
		this.navigationView.addChildView(this.titleField);
		if(delegate)
			this.delegate = delegate;
	}
	
	backButtonTriggered() {
		if(this.delegate)
			this.delgate.backButtonTriggered();
	}
	
	setCurrentView(view, titleString, saveOld) {
		if(this._currentView) {
			this.removeCurrentView();
		}
		this._currentView = view;
	}
	
	removeCurrentView() {
		// Remove the current view from children list of navigation view
		this.navigationView.removeChild(this._currentView);
	};
	
	setTitle(stringValue) {
		this.titleField.stringValue = stringValue;
	}
	
	pushToView(view, titleString, backwardString) {
		if(!this._currentView)
			return false;
		if(!backwardString)
			backwardString = "Back";
		var newTitleField = new DITextLabel();
		this.navigationView.addChildView(view);
		this.animatePushIn(this._currentView, view, this.titleField, newTitleField function() {
			this.setCurrentView(view, titleString);
		}.bind(this));
	}
	
	animatePushIn(oldView, newView, oldTitle, newTitle, func) {
		this.oldView.putInSleep();
		var originalName = newView.body.className;
		newView.body.className = originalName.concat("PushIn");
		newTitle.body.className = "NavTitlePushIn";
		if(this.backwardButton.hidden) {
			this.backwardButton.children[1].stringValue = oldTitle.stringValue;
			oldTitle.delete();
			this.backwardButton.children[1].body.className = "NavBackPushIn";
			this.backwardButton.hidden = false;
		}
		oldTitle.body.className = "NavBackPushIn";
		// this.newView.putInSleep();
		var tmp = new DeskEvent(newView.body, "animationend", function() {
			tmp.delete();
			newView.body.className = originalName;
			newView.wakeUp();
			func();
		}.bind(this));
	}
}