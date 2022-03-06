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

class DICanvasView extends DIView {
	constructor(image, className, idName) {
		if(!className)
			className='DICanvasView';
		super(className, idName);
		this.canHaveChild = false;
		this.canvasBody = document.createElement('canvas');
		this.body.appendChild(this.imageBody);
	}
	
	didMoveToDesk() {
		super.didMoveToDesk();
		this.canvasBody.style.width="".concat(this._width,"px");
		this.canvasBody.style.height="".concat(this._height,"px");
	}
}