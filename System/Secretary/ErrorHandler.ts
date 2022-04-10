/*
** Class	: ErrorHandler
**
** This handles error on both system level, and application level under Secretary
** 
*/

class ErrorHandler {
	constructor() {
		this.errWindows = new Array();
	}
	
	newAlert(content, innerHTML=false) {
		var winId = this.errWindows.length;
		this.errWindows.push(new DIWindow());
		var tmp = new DIAlertView();
		if(!innerHTML)
			tmp.stringValue=content;
		else
			tmp.alertContent.textBody.innerHTML=content;
		this.errWindows[winId].setChildView(tmp);
		tmp.addButton("Ok",this.errWindows[winId].close.bind(this.errWindows[winId]));
		tmp.addButton("Report",this.errWindows[winId].close.bind(this.errWindows[winId]));
		this.errWindows[winId].parent = this;
		Desk.addWindowAtCenter(this.errWindows[winId]);
	}
	
	closeWindow(window) {
		var i = this.errWindows.indexOf(window);
		Desk.closeWindow(window);
		this.errWindows[i] = null;
		if(i != 1) {
			this.errWindows.splice(i, 1);
		}
	}
}