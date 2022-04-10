/*
** Class	: DeskEvent
** 
** Object that handles event
** 
** properties
** 	-app			: app that the event got attached
**	-target			: target element
**	-method			: name of the event
**	-evtFunc		: the function that need to be called
**
*/

class DeskClipboard {
	constructor(dataType, data) {
		this.dataTypes = new Array;
		this.data = new Array;
		
		this.dataTypes.push(dataType);
		this.data.push(data);
	}
	
	addData(dataType, data) {
		this.dataTypes.push(dataType);
		this.data.push(data);
	}
	
	getData(dataType) {
		var index = this.dataTypes.indexOf(dataType);
		if(index == -1)
			return false;
		return this.data[index];
	}
	
	delete() {
		this.dataTypes = null;
		this.data = null;
	}
}