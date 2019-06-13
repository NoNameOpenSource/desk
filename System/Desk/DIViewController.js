/*
** Class	: DIViewController
** 
** This class is controller for the 'View' class
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DIViewController {
	constructor(view) {
		this.view;
		
		if(view)
			this.setChildView(view);
	}
	
	putInSleep() {
		this.view.putInSleep();
	}
	
	wakeUp() {
		this.view.wakeUp();
	}
	
	setChildView(child)  {
		this.view = child;
		this.view._controller = this;
		child.parent = this;
		child.didMoveToParent();
		return true;
	}
	
	removeChildView(child) {
		this.view = null;
	}
	
	didMoveToParent() {
		this.view.didMoveToParent();
	}
	
	didMoveToDesk() {
		this.view.didMoveToDesk();
	}
	
	delete() {
		if(this.view) {
			this.view.delete();
		}
	}
}