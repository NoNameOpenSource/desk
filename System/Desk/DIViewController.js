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
		this.app;
		this._view;
		
		if(view)
			this.view = view;
	}
	
	putInSleep() {
		this.view.putInSleep();
	}
	
	wakeUp() {
		this.view.wakeUp();
	}

	get view() {
		return this._view;
	}
	
	set view(view)  {
		this._view = view;
		if(view != null) {
			this.view._controller = this;
			view.parent = this;
		}
	}
	
	delete() {
		if(this.view) {
			this.view.delete();
		}
	}
}