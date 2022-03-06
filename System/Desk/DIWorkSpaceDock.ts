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

class DIWorkSpaceDock extends DIView {
	constructor(idName) {
		super(null, idName);
		
		// Init for context menu
		this.contextMenu = new DIListView(this, this, 1, "DIContextMenu");
		this.contextMenu.cellHeight = 25;
		this.contextList = new Array();
		// Init context event
		this.events.push(new DeskEvent(this.body, "contextmenu", function(evt){
			evt.preventDefault();
			var index = Math.floor((evt.clientY - 28)/64); // 28 for y of this view
			this.workSpaceIndex = index;
			if(index >= 0 && index < Secretary.workSpaces.length) {
				if(Secretary.workSpaces[index].loaded) {
					if(Secretary.workSpaces[index] == Secretary.mainWorkSpace)
						this.contextList = ["Restart"];
					else
						this.contextList = ["Quit"];
				} else {
					this.contextList = ["Open"];
				}
			}
			this.contextMenu.reloadData();
			this.contextMenu.x = 74;
			this.contextMenu.y = 21 + (64*index);
			this.addChildView(this.contextMenu);
			if(this.contextEvent) {
				this.contextEvent.delete();
				this.contextEvent = null;
			}
			this.contextEvent = new DeskEvent(document.body, "mousedown", function(evt) {
				if(!((this.contextMenu.body.getBoundingClientRect().left <= evt.clientX && evt.clientX <= this.contextMenu.body.getBoundingClientRect().right) && (this.contextMenu.body.getBoundingClientRect().top <= evt.clientY && evt.clientY <= this.contextMenu.body.getBoundingClientRect().bottom))) {
					this.clearContextMenu();
					this.contextEvent.delete();
					this.contextEvent = null;
					if(evt.clientY > Desk.headerHeight && evt.clientX < 64) {
						evt.stopPropagation();
						evt.preventDefault();
						if(!this.preventClick) { // add the event only it is not there
							this.preventClick = new DeskEvent(this.body, "click", function(evt) {
								if(this.preventClick)
									this.preventClick.delete();
								evt.stopPropagation();
								evt.preventDefault();
							}.bind(this))
						}
					}
				}
			}.bind(this));
		}.bind(this)));
	}
	
	clearContextMenu() {
		this.removeChildView(this.contextMenu);
	}
	
	numberOfRows(listView) {
		if(listView==this.contextMenu)
			return this.contextList.length;
	}

	cellAtRow(listView, row) {
		if(listView == this.contextMenu)  {
			var cell = new DIListViewCell("DIContextMenuCell");
			cell.name = new DILabel(this.contextList[row]);
			cell.addChildView(cell.name);
			return cell;
		}
		return false;
	}
	
	listDidSelectRowAtIndex(listView, index) {
		if(listView==this.contextMenu) {
			if(index>=0) {
				if(this.contextEvent) {
					this.contextEvent.delete();
					this.contextEvent = null;
				}
				this.clearContextMenu();
				if(this.contextList[index] == "Open") {
					Secretary.setMainWorkSpace(Secretary.workSpaces[this.workSpaceIndex]);
				} else if(this.contextList[index] == "Quit") {
					Secretary.quitWorkSpace(this.workSpaceIndex);
					this.update();
				} else if(this.contextList[index] == "Restart") {
				}
			}
		}
	}
	
	update() {
		this.unplugChildViews();
		var i = 0;
		for(;i<Secretary.workSpaces.length;i++) {
			this.addChildView(Secretary.workSpaces[i].icon);
			Secretary.workSpaces[i].icon.y = i*64;
			if(Secretary.workSpaces[i].icon.events.length < 1) {
				Secretary.workSpaces[i].icon.events.push(new DeskEvent(Secretary.workSpaces[i].icon.body, "click", function() {
					Desk.workSpaceDock.clicked(this);
				}.bind(Secretary.workSpaces[i])));
			}
			Secretary.workSpaces[i].icon.body.style.background = "";
			if(Secretary.mainWorkSpace == Secretary.workSpaces[i]) {
				Secretary.workSpaces[i].icon.body.style.background = "rgba(52,152,219, 0.4)";
			}
		}
	}
	
	clicked(workSpace) {
		if(!(Secretary.mainWorkSpace == workSpace)) {
			Secretary.setMainWorkSpace(workSpace);
		}
	}
	
	didMoveToDesk() {
		this._width = this.body.offsetWidth;
		this._height = this.body.offsetHeight;
	}
	
	get stringValue() {
		return this.textBody.textContent;
	}
	
	set stringValue(value) {
		this.textBody.textContent = value;
	}
	
	get width() {
		return this._width;
	}
	
	set width(value) {
		this._width = value;
		this.body.style.width = "".concat(value, "px");
		//this.textBody.style.width = "".concat(value, "px");
	}
	
	delete() {
		this.textBody.remove();
		super.delete();
	}
}