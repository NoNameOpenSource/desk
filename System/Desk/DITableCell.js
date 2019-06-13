class DITableCell {
	constructor(className, idName) {
		if(!className)
			className='DITableView';
		this.body = document.createElement("td");
	}
}