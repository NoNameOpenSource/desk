class DeskMenuListViewCell extends DIListViewCell {
	constructor() {
		super('DeskMenuListCell');
		this.icon = new DIImageView();
		this.addChildView(this.icon);
		this.name = new DILabel(false, "DeskMenuListString");
		this.addChildView(this.name);
	}
}