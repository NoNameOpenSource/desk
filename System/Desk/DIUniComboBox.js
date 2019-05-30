/*
** Class	: DIUniComboBox
** 
** This is better version of DIComboBox to support international languages that uses combinations of characters to type
** 
** properties
** 	-x				: x coordinate
**	-y				: y coordinate
**	-body			: Body of the view as HTML element
**	-child			: Array of child views of this view
**
*/

class DIUniComboBox extends DIView {
	constructor(className, idName, inputClass, selectClass, inputId, selectId) {
		if(!className)
			className='DIUniComboBox';
		if(!inputClass)
			inputClass='DIUniComboBoxInput';
		if(!selectClass)
			selectClass='DIUniComboBoxSelect';
		super(className, idName);
		
		this.textBody = document.createElement('p');
		if(inputClass)
			this.textBody.className = inputClass;
		if(inputId)
			this.textBody.id = inputId;
		this.selectedBody = document.createElement('p');
		if(selectClass)
			this.selectedBody.className = selectClass;
		if(selectId)
			this.selectedBody.id = selectId;
		this.body.appendChild(this.textBody);
		this.body.appendChild(this.selectedBody);
		
		this.drawArrow();
		
		this.editable=true;
		
		this.items=new Array();
		this.filtered=new Array();
		this.searchedItems=new Array();
		
		this.escapeKey=true;
		
		this.oldString = "";
		this._usingHint=false;
		this.color="#000";
		
		this.dropDownView = new DIListView(false,false,2,"DIComboBoxDropDown");
		this.dropDownView.dataSource=this;
		this.dropDownView.delegate=this;
		this.dropDownView.hidden=true;
		this.addChildView(this.dropDownView);
		
		this.searching=false;
		
		this.listRequested=false;
		
		this.dropDownViewTriggered = false;
		
		//this.cell = DIPopUpCell;
		//this.english=false;
	}
	
	drawArrow() {
		this.arrowBody=document.createElement('img');
		this.arrowBody.className='DIComboBoxArrow';
		this.arrowBody.setAttribute('src','/System/Desk/Resources/DIComboBoxArrow.svg');
		this.body.appendChild(this.arrowBody);
		
		this.events.push(new DeskEvent(this.arrowBody, "click", this.triggerDropDownView.bind(this)));
	}
	
	focusIn() {
		if(this._inSleep)
			this.wakeUp();
	}
	
	// Drop Down View Codes
	triggerDropDownView() {
		if(this.dropDownViewTriggered) {
			this.dropDownView.hidden=true;
			this.dropDownViewTriggered=false;
		} else {
			if(this.editable) {
				if(this.stringValue==="" && this.items.length!=this.searchedItems.length)
					this.searchedItems=this.items.slice();
				this.dropDownViewTriggered=true;
				this.dropDownView.hidden=false;
				this.dropDownView.reloadData();
				if(this.body.getBoundingClientRect().bottom+this.cellHeight*5>Desk.screenHeight) {
					this.dropDownView.body.style.top="";
					this.dropDownView.body.style.bottom="".concat(this.height,"px");
					this.dropDownView.body.style.boxShadow="0px -6px 10px 0px rgba(0,0,0,0.3)";
				} else {
					this.dropDownView.body.style.bottom="";
					this.dropDownView.body.style.top="".concat(this.height,"px");
					this.dropDownView.body.style.boxShadow="0px 9px 10px 2px rgba(0,0,0,0.3)";
				}
			}
		}
	}
	
	finishedLoading() {
		return this.searching;
	}
	
	cellAtRow(listView, row) {
		var cell = new DIPopUpCell(this.searchedItems[row]);
		cell.height = this.cellHeight;
		return cell;
	}
	
	numberOfRows(listView) {
		if(this.searchedItems.length==0)
			listView.hidden=true;
		else
			listView.hidden=false;
		return this.searchedItems.length;
	}
	
	listDidSelectRowAtIndex(listView, index) {
		if(index==-1)
			this.triggerDropDownView();
		else {
			this.stringValue=this.searchedItems[index];
			this.usingHint=false;
			this.textBody.focus();
			var range = document.createRange();
			range.setStart(this.textBody.firstChild,0);
			range.setEnd(this.textBody.firstChild,this.stringValue.length);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
			this.triggerDropDownView();
			this.escapeKey=true;
			this.searchHints();
		}
	}
	
	// Input Handlers
	
	mouseDown(evt) {
		var body = this.body.getBoundingClientRect();
		if(evt.clientX<body.left || evt.clientX>body.right) {
			this.putInSleep();
			return;
		}
		if(!this.dropDownViewTriggered && (evt.clientY<body.top || evt.clientY>body.bottom)) {
			this.putInSleep();
			return;
		}
		if(this.dropDownViewTriggered) {
			var height = (this.searchedItems.length<5)? this.cellHeight*this.searchedItems.length : this.cellHeight*5;
			if(this.dropDownView.body.style.bottom==="") {
				if(evt.clientY>body.bottom+height || evt.clientY<body.top) {
					this.putInSleep();
					return;
				}
			}
			else {
				if(evt.clientY>body.bottom || evt.clientY<body.top-height) {
					this.putInSleep();
					return;
				}
			}
		}
		if(this._inSleep)
			this.wakeUp();
		if(this.body.getBoundingClientRect().right-evt.clientX>this.height) {
			if(this.usingHint) {
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				
				if(this.dropDownViewTriggered) {
					this.escapeKey=true;
					this.searchHints();
				}
			}
			this.usingHint=false;
		} else
			this.usingHint=false;
	}
	
	keyDown(evt) {
		if(evt.keyCode==8 || evt.keyCode==46) { // Backspace & Delete
			this.escapeKey=true;
			if(this.usingHint) {
				evt.preventDefault();
				this.usingHint=false;
			}
		} else if(evt.keyCode==39) { // Right Arrow
			if(this.usingHint) {
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				this.usingHint=false;
				this.textBody.focus();
				var sel = window.getSelection();
				sel.collapse(this.textBody.firstChild, this.stringValue.length);
				evt.preventDefault();
			}
		} else if(evt.keyCode==40) { // Down Arrow
			if(this.dropDownViewTriggered) {
				this.dropDownView.moveSelection(1);
				evt.preventDefault();
			} else {
				this.triggerDropDownView();
				if(this.usingHint)
					this.dropDownView.highlightCellAtIndex(0);
			}
			if(this.usingHint) {
				var start = this.stringValue.length;
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				this.usingHint=false;
				this.textBody.focus();
				var range = document.createRange();
				range.setStart(this.textBody.firstChild,start);
				range.setEnd(this.textBody.firstChild,this.stringValue.length);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				evt.preventDefault();
			}
		} else if(evt.keyCode==38) { // Up Arrow
			if(this.dropDownViewTriggered) {
				this.dropDownView.moveSelection(-1);
				evt.preventDefault();
			}
			if(this.usingHint) {
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				this.usingHint=false;
				this.textBody.focus();
				var sel = window.getSelection();
				sel.collapse(this.textBody.firstChild, 0);
				evt.preventDefault();
			}
		} else if(evt.keyCode==13) { // Enter Key
			if(this.dropDownViewTriggered) {
				this.listDidSelectRowAtIndex(this.dropDownView, this.dropDownView.selectedIndex);
			}else if(this.usingHint) {
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				this.usingHint=false;
				this.textBody.focus();
				var sel = window.getSelection();
				sel.collapse(this.textBody.firstChild, this.stringValue.length);
			}
			evt.preventDefault();
		} else if(evt.keyCode==9) { // Tab key
			this.putInSleep();
		} else if(event.keyCode==91 || event.keyCode==93) { // CMD key
			if(this.usingHint) {
				var start = this.stringValue.length;
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				this.usingHint=false;
				this.textBody.focus();
				var range = document.createRange();
				range.setStart(this.textBody.firstChild,start);
				range.setEnd(this.textBody.firstChild,this.stringValue.length);
				var sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				evt.preventDefault();
			}
		} else if(evt.keyCode==37) { // Left key
			if(this.usingHint) {
				var start = this.stringValue.length;
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				this.usingHint=false;
				this.textBody.focus();
				var sel = window.getSelection();
				sel.collapse(this.textBody.firstChild, start);
				evt.preventDefault();
			}
		} else {
			this.escapeKey=false;
			this.english = (evt.keyCode<91) ? true : false;
		}
	}
	
	// Autocomplete & Search Codes
	
	searchHints() {
		this.searching=true;
		var founded=false;
		this.searchedItems.length=0;
		var i=0;
		var inpputed = this.english ? this.stringValue.toLowerCase() : this.stringValue;
		if(!this.escapeKey) {
			for(;i<this.filtered.length;i++) {
				if(this.filtered[i].indexOf(inpputed) === 0) {
					var start = this.stringValue.length;
					this.selectedBody.textContent=this.items[i].substr(start);
					if(this.english) {
						this.stringValue=this.items[i].substr(0,start);
						var sel = window.getSelection();
						sel.collapse(this.textBody.firstChild, this.stringValue.length);
					}
					this.searchedItems.push(this.items[i]);
					founded=true;
					break;
				}
			}
			i+=1;
		}
		if(!founded)
			this.usingHint=false;
		else
			this.usingHint=true;
		for(;i<this.items.length;i++) {
			if(this.items[i].indexOf(inpputed) === 0) {
				this.searchedItems.push(this.items[i]);
			}
		}
		this.searching=false;
		if(this.listRequested)
			this.searchingDone();
		if(this.dropDownViewTriggered)
			this.dropDownView.reloadData();
	}
	
	addItem(item) {
		if(this.useDataSource) {
		}
		else {
			this.items.push(item);
			this.filtered.push(item.toLowerCase());
		}
	}
	
	addItems() {
		for(var i=0;i<arguments.length;i++)
			this.addItem(arguments[i]);
	}
	
	putInSleep() {
		this._inSleep=true;
		if(this.dropDownViewTriggered)
			this.triggerDropDownView();
		if(this.usingHint) {
			this.stringValue = this.stringValue+this.selectedBody.textContent;
			
			if(this.dropDownViewTriggered) {
				this.escapeKey=true;
				this.searchHints();
			}
		}
		this.usingHint=false;
		if(this.editable) {
			this.events[this.keyEvent].stop();
			this.events[this.keyEvent+1].stop();
		}
	}
	
	wakeUp() {
		this._inSleep=false;
		if(this.editable) {
			this.events[this.keyEvent].resume();
			this.events[this.keyEvent+1].resume();
		}
	}
	
	didMoveToDesk() {
		this.dropDownView.body.style.maxHeight="".concat(this.cellHeight*5,"px");
		this.dropDownView.cellHeight=this.cellHeight;
		
		this.event = new DeskEvent(this._window.body, "mousedown", this.mouseDown.bind(this));
		this.keyEvent = this.events.length;
		this.events.push(new DeskEvent(this.body, "keydown", this.keyDown.bind(this)));
		this.events.push(new DeskEvent(this.textBody, "input", this.searchHints.bind(this)));
		this.events.push(new DeskEvent(this.textBody, "focus", this.focusIn.bind(this)));
	}
	
	get usingHint() {
		return this._usingHint;
	}
	
	set usingHint(value) {
		if(this._usingHint==value)
			return false;
		this._usingHint=value;
		if(this._usingHint) {
			this.textBody.style.color="transparent";
			this.textBody.style.textShadow="0 0 0 ".concat(this.color);
		} else {
			this.textBody.style.color="";
			this.textBody.style.textShadow="";
			this.selectedBody.textContent="";
		}
	}
	
	
	get editable() {
		return this._editable;
	}
	
	set editable(value) {
		this._editable = value;
		if(value) {
			if(this.event) {
				this.event.resume();
			}
			if(!this._inSleep && this.onDesk) {
				this.events[this.keyEvent].resume();
				this.events[this.keyEvent+1].resume();
			}
			this.textBody.setAttribute("contenteditable","true");
			this.arrowBody.hidden = false;
		} else {
			if(this.event) {
				this.event.stop();
			}
			if(this.dropDownViewTriggered)
				this.triggerDropDownView();
			if(this.usingHint) {
				this.stringValue = this.stringValue+this.selectedBody.textContent;
				
				if(this.dropDownViewTriggered) {
					this.escapeKey=true;
					this.searchHints();
				}
			}
			this.usingHint=false;
			if(!this._inSleep && this.onDesk) {
				this.events[this.keyEvent].stop();
				this.events[this.keyEvent+1].stop();
			}
			this.textBody.setAttribute("contenteditable","false");
			this.arrowBody.hidden = true;
		}
	}
	
	get stringValue() {
		return this.textBody.textContent;
	}
	
	set stringValue(value) {
		this.textBody.textContent = value;
	}
	
	get height() {
		if(!this._height)
			this._height = this.body.offsetHeight;
		return this._height;
	}
	
	set height(value) {
		super.height=value;
		this.arrowBody.style.height = this.body.style.height;
		this.arrowBody.style.width = this.body.style.height;
	}
	
	delete() {
		this.event.delete();
		this.event = null;
		super.delete();
	}
}