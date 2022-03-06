class DIToolbar extends DIView {
	constructor(delegate, className) {
		super(className);

		this.delegate = delegate;

		this.items = [];
		this.width = 0;
	}

	addItem(item) {
		item.x = this.width;
		this.width += item.width;
		let identifier = item.identifier;
		item.setButtonEvent(evt => {
			this.itemSelected(identifier);
		});
		this.addChildView(item);
		this.items.push(item);
	}

	itemSelected() {
		if(!this.delegate)
			return;
		this.delegate.toolBarSelected(item.identifier);
	}
}