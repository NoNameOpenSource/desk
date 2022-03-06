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

	reloadData() {
		this.listView.reloadData();
	}

	// ListView Delegate Section
	numberOfRows(listView) {
		if(listView==this.listView)
			return Secretary.appList.length;
		if(listView==this.contextMenu)
			return this.contextList.length;
	}

	cellAtRow(listView, row) {
		if(listView == this.listView) {
			var cell = new DeskMenuListViewCell();
			cell.width = this.width - 32;
			cell.name.stringValue = Secretary.appList[row];
			cell.icon.imageSource = "/System/Secretary/AppIcon/" + Secretary.appList[row] + ".png";
			return cell;
		}
	}

	listDidSelectRowAtIndex(listView, index) {
		if(listView==this.listView) {
			if(index>=0) {
				listView.deselectAll()
				Secretary.mainWorkSpace.loadApp(Secretary.appList[index], []);
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