class DrawerSavePanel extends DIView {
	constructor(delegate, folder) {
		super("DrawerPanel");

		this.type = "savePanel";

		this.drawerPanelContainer = new DIView("DrawerPanelContainer");
		this.drawerPanelContainer.x = 10;
		this.drawerPanelContainer.width = 340;
		this.drawer = new Drawer(Secretary.mainWorkSpace, "DrawerPanel", {drawerType: "openPanel"});
		this.drawer.window.closeButton.hidden = true;
		this.drawer.window.minButton.hidden = true;
		this.drawer.minWidth = 340;
		this.drawer.window.width = this.drawer.minWidth;
		this.drawerPanelContainer.addChildView(this.drawer.window);
		this.addChildView(this.drawerPanelContainer);

		// add name field
		this.nameField = new DITextField("", true, "DrawerNameField");
		this.nameField.body.style.top = "calc(100% - 273px)";
		this.addChildView(this.nameField);

		// add cancel button
		this.cancelButton = new DIButton("Cancel", "DISmallAlertViewButton");
		this.cancelButton.setButtonEvent(this.cancel.bind(this));
		this.cancelButton.body.style.top = "calc(100% - 240px)";
		this.cancelButton.body.style.width = "calc(50% - 10px)";
		this.cancelButton.body.style.right = "10px";
		this.addChildView(this.cancelButton);

		// add save button
		this.openButton = new DIButton("Save", "DISmallAlertViewButton");
		this.openButton.setButtonEvent(this.save.bind(this));
		this.openButton.body.style.top = "calc(100% - 240px)";
		this.openButton.body.style.width = "calc(50% - 10px)";
		this.openButton.body.style.left = "10px";
		this.addChildView(this.openButton);

		this.delegate = delegate;
	}

	cancel() {
		this.delegate.drawerPanelCanceled();
	}

	save() {
		if(this.drawer.listView.selected.length == 1) { return; }
		var folder = this.drawer.locationData;
		this.delegate.drawerPanelSelected(folder, this.nameField.stringValue);
	}
}