class DITableCell {
	constructor(className, idName) {
		if(!className)
			className='DITableView';
		this.body = document.createElement("td");
		this.table;
		this.editable = true;
		this.event = new DeskEvent(this.body, "dblclick", this.dblclick.bind(this));
	}

	dblclick(evt) {
		let result = true;
		if(this.table) {
			result = this.table.cellClicked(this);
		}
		if(result && this.editable) {
			this.beginEdit();
		}
	}

	beginEdit() {
		this.blurEvent = new DeskEvent(this.body, "blur", this.endEdit.bind(this));
		this.oldValue = this.text;
		this.body.setAttribute("contentEditable", true);
		this.body.focus();
	}

	endEdit() {
		this.blurEvent.delete();
		this.blurEvent = null;
		this.body.removeAttribute("contentEditable");

		if(!this.table && this.oldValue == this.text) { return; }
		this.table.cellUpdated(this);
	}

	get text() {
		return this.body.innerText;
	}

	set text(newValue) {
		this.body.innerText = newValue;
	}
}