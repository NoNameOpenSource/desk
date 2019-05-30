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

class DIImageView extends DIView {
	constructor(image, className, idName) {
		if(!className)
			className='DIImageView';
		super(className, idName);
		this.canHaveChild = false;
		this.imageBody = document.createElement('IMG');
		if(image)
			this.imageSource = image;
		this.body.appendChild(this.imageBody);
	}
	
	get imageSource() {
		return this._src;
	}
	
	set imageSource(value) {
		this._src = value;
		this.imageBody.setAttribute("src", value);
	}
}