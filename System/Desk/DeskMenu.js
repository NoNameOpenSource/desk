class DeskMenu extends DIView {
	constructor() {
		super(null, "DeskMenu");

		// this is not active for default
		this._active = false;

		// Init list view
		this.listViewContainer = new DIView("DeskMenuViewContainer");
		this.listView;
		this.listView = new DIDragListView(this, this, 2, "ListView", false);
		this.listView.cellHeight = 40;
		this.listViewContainer.addChildView(this.listView);
		this.listView.body.style.width = "100%";
		this.listView.body.style.height = "100%";

		this.addChildView(this.listViewContainer);
		this.listView.reloadData();
	}

	// ListView Delegate Section
	numberOfRows(listView) {
		if(listView==this.listView)
			return 3;
		if(listView==this.contextMenu)
			return this.contextList.length;
	}

	cellAtRow(listView, row) {
		if(listView == this.listView) {
			var cell = new DeskMenuListViewCell();
			cell.width = this.width - 32;
			if(row == 0) {
				cell.name.stringValue = "Drawer";
				cell.icon.imageSource = "/System/Secretary/AppIcon/Drawer.png";
			} else if(row == 1) {
				cell.name.stringValue = "Preview";
				cell.icon.imageSource = "/System/Secretary/AppIcon/Preview.png";
			} else if(row == 2) {
				cell.name.stringValue = "WorkSheets";
				cell.icon.imageSource = "/System/Secretary/AppIcon/worksheets.png";
			}
			return cell;
		}
	}

	listDidSelectRowAtIndex(listView, index) {
		if(listView==this.listView) {
			if(index>=0) {
				listView.deselectAll()
				if(index == 0) {
					Secretary.mainWorkSpace.loadApp("Drawer", [])
				} else if(index == 1) {
					Secretary.mainWorkSpace.loadApp("Preview", [])
				} else if(index == 2) {
					Secretary.mainWorkSpace.loadApp("WorkSheets", [])
				}
			}
		}
	}
	
	listDidHighlightedCells(listView, selected) {
	}
	
	get width() {
		if(!this._width)
			this._width = this.body.offsetWidth;
		return this._width;
	}

	set width(value) {
		this._width = value;
		this.body.style.width = "".concat(value, "px");
		var i = 0;
		var width = value - 32;
		for(;i<this.listView.children.length; i++) {
			this.listView.children[i].width = width;
		}
	}

	get active() {
		return this._active;
	}

	set active(value) {
		if(value) {
			this.wakeUp();
		} else {
			this.putInSleep();
		}
		this._active = value;
	}
}