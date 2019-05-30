/*
** Class	: DIListViewCell
** 
** Cell for the view
** 
** properties
**	-listCell		: Class that will be used for make cells
**	-cell			: Array of the cells
**
*/

class DIListViewCell extends DIView {
	constructor(className, idName) {
		if(!className)
			className='DIListCell';
		super(className, idName);
		this.selected = false;
	}
	
	select() {
		if(!this.selected) {
			this.body.className = this.body.className.concat('Selected');
			this.selected = true;
		}
	}
	
	deselect() {
		if(this.selected) {
			this.body.className = this.body.className.substring(0, this.body.className.length - 8);
			this.selected = false;
		}
	}
}