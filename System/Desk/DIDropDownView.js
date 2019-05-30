class DIDropDownView extends DIListView {
	constructor(dataSource, delegate, cellClickType, className, idName) {
		if(!className)
			className='DIListView';
		super(false, delegate, 3, className, idName);
		if(dataSource) {
			this.dataSource = dataSource;
		}
		this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
		this.moveEvent=null;
	}
	
	mouseDown(evt) {
		evt.preventDefault();
		this.hightlightCell(Math.floor((evt.clientY-this.body.getBoundingClientRect().top)/this.cellHeight));
		this.moveEvent = this.events.length;
		document.documentElement.style.cursor="default";
		document.documentElement.style.['-webkit-user-select']="none";
		this.events.push(new DeskEvent(document, "mousemove", this.mouseMove.bind(this)));
		this.events.push(new DeskEvent(document, "mouseup", this.mouseUp.bind(this)));
	}
	
	mouseMove(evt) {
		var body = this.body.getBoundingClientRect();
		if(evt.clientX>body.left && evt.clientX<body.right) {
			// If y is higher than top, top becomes y. If y is lower than bottom, bottom becomes y.
			var y = (((evt.clientY<body.top)? evt.clientY : body.top)>body.bottom)? evt.clientY : body.bottom;
			this.hightlightCell(Math.floor((y-body.top)/this.cellHeight));
		}
	}
	
	mouseUp(evt) {
		this.events[this.moveEvent].delete();
		document.documentElement.style.cursor="";
		document.documentElement.style.['-webkit-user-select']="";
		this.events[this.moveEvent+1].delete();
		this.events.splice(this.mouseEvent, 2);
		didSelectRowAtIndex();
	}
	
	hightlightCell(index) {
		if(selected == this.children[index])
			return false;
		if(this.selected) {
			this.selected.deselect();
		}
		this.selected = this.children[index];
		this.selected.selected();
		this.selectedIndex = index;
	}
}