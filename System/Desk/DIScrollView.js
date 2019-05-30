/*
** Class	: DIScrollView
** 
** This is view class for the items that will be displayed on the screen
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DIScrollView extends DIView {
	constructor(className, idName) {
		if(!className)
			className='DIScrollView';
		super(className, idName);
	}
}