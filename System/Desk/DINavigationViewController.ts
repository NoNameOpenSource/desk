import { DeskEvent } from "../Secretary/DeskEvent";
import { DILabel } from "./DILabel";
import { DIView } from "./DIView";
import { DIViewController } from "./DIViewController";

export class DINavigationViewController extends DIViewController {
	navigationView: DIView;
	_currentView: any;
	backwardButton: DIView;
	titleField: any;
	delegate: any;
	oldView: any;


	/**
	 * @todo remove idName
	 */
	constructor(className?: string, idName?: string, delegate?: any) {
		if(!className)
			className='DINavigationViewController';
		super(new DIView());
		// Setting up navigation bar(view)
		this.navigationView = new DIView();
		this.view.addChildView(this.navigationView);
		this._currentView;
		this.backwardButton = new DIView();
		this.titleField = new DILabel();
		this.navigationView.addChildView(this.backwardButton);
		this.backwardButton.events.push(new DeskEvent(this.backwardButton.body, "onclick", this.backButtonTriggered.bind(this)));
		this.navigationView.addChildView(this.titleField);
		if(delegate)
			this.delegate = delegate;
	}
	
	backButtonTriggered() {
		if(this.delegate)
			this.delegate.backButtonTriggered();
	}
	
	setCurrentView(view, titleString, saveOld) {
		if(this._currentView) {
			this.removeCurrentView();
		}
		this._currentView = view;
	}
	
	removeCurrentView() {
		// Remove the current view from children list of navigation view
		this.navigationView.removeChildView(this._currentView);
	};
	
	setTitle(stringValue) {
		this.titleField.stringValue = stringValue;
	}
	
	pushToView(view, titleString, backwardString) {
		if(!this._currentView)
			return false;
		if(!backwardString)
			backwardString = "Back";
		var newTitleField = new DILabel();
		this.navigationView.addChildView(view);
		this.animatePushIn(this._currentView, view, this.titleField, newTitleField, function() {
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
