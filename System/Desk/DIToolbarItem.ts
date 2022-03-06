class DIToolbarItem extends DIButton {
	constructor(text, icon, className) {
		super(text, "DIToolboaItem");
		this.body.removeChild(this.ocrButton.buttonBody);
		this.buttonBody = document.createElement('img');
		this.buttonBody.className='DINavigatorIcon';
		this.setAttribute('src', icon);
	}
}