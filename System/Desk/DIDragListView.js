/*
** Class	: DIListView
** 
** This is a view that displays lists
** 
** properties
**	-cell			: Array of the cells
**	-dataSource		: Object that will provide data to make list
**
*/

class DIDragListView extends DIListView {
	constructor(dataSource, delegate, className, idName) {
		super(dataSource, delegate, -1, className, idName);
		
		this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
		
		this.selected = new Array();
		this.lastHighlightedCell = -1;

		this.multipleSelection = true;
	}
	
	mouseDown(evt) {
		//evt.preventDefault();
		if(evt.button == 0) {
			this.deselectAll();
			this.selectedIndex = Math.floor((this.body.scrollTop+evt.clientY-this.body.getBoundingClientRect().top)/this.cellHeight);
			if(this.selectedIndex>=0 && this.selectedIndex<this.children.length) {
				evt.preventDefault();
				this.highlightCellAtIndex(this.selectedIndex);
				this.moveEvent = this.events.length;
				document.documentElement.style['-webkit-user-select']="none";
				document.documentElement.style.cursor="default";
				this.events.push(new DeskEvent(document, "mousemove", this.mouseMove.bind(this)));
				this.events.push(new DeskEvent(document, "mouseup", this.mouseUp.bind(this)));
				if(!this.multipleSelection) {
					this.mouseUp(evt);
				}
			} else { // 여기 때문에 빈공간에서 부터 드래그가 안됨 ;-;
				this.delegate.listDidHighlightedCells(this, this.selected);
			}
		} else if(evt.button == 2) {
		}
	}
	
	mouseMove(evt) {
		if(evt.button == 0) {
			var body = this.body.getBoundingClientRect();
			if(evt.clientX>body.left && evt.clientX<body.right) {
				// If y is higher than top, top becomes y. If y is lower than bottom, bottom becomes y.
				//var y = (evt.clientY<body.bottom)? ((evt.clientY>body.top)? evt.clientY : body.top) : (body.bottom - 1);
				var index = Math.floor((this.body.scrollTop+evt.clientY-this.body.getBoundingClientRect().top)/this.cellHeight);
				this.dragToIndex(index);
			}
		}
	}
	
	mouseUp(evt) {
		if(evt.button == 0) {
			this.events[this.moveEvent].delete();
			document.documentElement.style.cursor="";
			document.documentElement.style['-webkit-user-select']="";
			this.events[this.moveEvent+1].delete();
			this.events.splice(this.moveEvent, 2);
			
			var body = this.body.getBoundingClientRect();
			var index = Math.floor((this.body.scrollTop+evt.clientY-body.top)/this.cellHeight);
			if(index == this.selectedIndex) {
				this.didSelectRowAtIndex(this.selectedIndex);
			} else {
				var i = 0;
				this.selected.length = 0;
				for(;i<this.children.length;i++) {
					if(this.children[i].selected)
						this.selected.push(i);
				}
				if(this.delegate.listDidHighlightedCells)
					this.delegate.listDidHighlightedCells(this, this.selected);
			}
		}
	}
	
	dragToIndex(index) {
		if(index == 6 ) {
			var jk = 0;
		}
		if(this.lastHighlightedCell - index > 0) {
			var j = this.lastHighlightedCell - index;
			var lastIndex = this.lastHighlightedCell;
			var i = 1;
			for(;i<=j;i++) {
				this.dragOnIndex(lastIndex - i);
			}
		} else {
			var j = index - this.lastHighlightedCell;
			var lastIndex = this.lastHighlightedCell;
			var i = 1;
			for(;i<=j;i++) {
				this.dragOnIndex(lastIndex + i);
			}
		}
	}
	
	dragOnIndex(index) {
		if(index != this.lastHighlightedCell) {
			if((this.lastHighlightedCell > index) && (this.lastHighlightedCell > this.selectedIndex)) {
				this.children[this.lastHighlightedCell].deselect();
			} else if((this.lastHighlightedCell < index) && (this.lastHighlightedCell < this.selectedIndex)){
				this.children[this.lastHighlightedCell].deselect();
			}
		}
		this.highlightCellAtIndex(index);
	}
	
	highlightCellAtIndex(index) {
		if(index<0 || index>=this.children.length)
			return false;
		if(!this.children[index].selected) {
			this.children[index].select();
		}
		this.lastHighlightedCell = index;
	}
	
	deselectAll() {
		if(this.selected.length > 0) {
			var i = 0;
			for(;i<this.selected.length;i++) {
				this.children[this.selected[i]].deselect();
			}
			this.selected.length = 0;
		}
	}
	
	/*
	** selectCustomCellById
	** 
	** return	: New custom cell object
	** 
	** properties
	** 	-name		: id of the custom cell to call
	**
	*/
	getCustomCellById(name) {
	}
	
	/*
	** reloadData
	** 
	** This clears existing cells, and update it
	** 
	*/
	reloadData(){
		this.reloadTicket += 1;
		var ticket = this.reloadTicket;
		var scrollPos = this.body.scrollTop;
		this.clearChildViews();
		this.selected.length = 0;
		this.selectedIndex = -1;
		var length = this.dataSource.numberOfRows(this);
		for(var i=0; i<length; i++) {
			if(this.reloadTicket == ticket) {
				let cell = this.dataSource.cellAtRow(this,i);
				this.addCell(cell);
			} else
				break;
		}
		if(this.reloadTicket == ticket)
			this.body.scrollTop = scrollPos;
	}

	addCell(cell) {
		cell.y = this.children.length * this.cellHeight;
		this.addChildView(cell);
	}
	
	didSelectRowAtIndex(index) {
		this.deselectAll();
		if(index<this.children.length && index>=0) {
			this.selected.push(index);
			this.children[index].select();
		} else {
			index = -1;
		}
		this.selectedIndex = index;
		this.delegate.listDidSelectRowAtIndex(this, index);
	}
	
	delete(){
		this.delegate = null;
		this.dataSource = null;
		if(this.cellClickType == 1) {
			if(this.event) {
				this.event.delete();
				this.event = null;
			}
		}
		super.delete();
	}
}