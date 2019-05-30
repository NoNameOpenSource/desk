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

class DIPDFView extends DIView {
	constructor(url, className, idName) {
		if(!className)
			className='DIImageView';
		super(className, idName);
		this.canHaveChild = false;
		this.pdfBody = document.createElement('EMBED');
		this.pdfBody.setAttribute("alt", "pdf");
		this.pdfBody.setAttribute("pluginspage", "http://www.adobe.com/products/acrobat/readstep2.html");
		if(url)
			this.imageSource = url;
		this.body.appendChild(this.pdfBody);
	}
	
	get imageSource() {
		return this._src;
	}
	
	set imageSource(value) {
		this._src = value;
		this.pdfBody.setAttribute("src", value);
	}
}