class DITabView extends DIView {
	constructor(className, idName) {
		if(!className)
			className='DITableView';
		super(className, idName);

		this.addChildView(this.addChildView);
	}

	addPage(viewController) {
	}
}