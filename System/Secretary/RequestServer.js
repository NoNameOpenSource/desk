/*
** Class	: RequestServer
** 
** This class is dedicated to seding ajax request with formData.
** It's just wrapping XMLHttpRequest bit easier way.
** 
** properties
** 	-url        : Similar to Widnows` PID, it determinates which app this is from other apps, running.
**	-ajax        : Name of the Application
**	-formData		: Type of the Application
**		-null		: -1
**		-GUIapp	: 1
**		-Widget	: 2
**		-noGUI		: 3
**	-appBody		:Body of the Application. This is Highest HTML Elements of GUI of this app.
**
*/
class RequestServer {
	constructor(dataBlock, useMultipart, sync) {
		this.url = Secretary.dataManagerURL;
		this.ajax = new XMLHttpRequest();
		if(useMultipart || Secretary.serverType == "php")
			this.useMultipart = true;
		else
			this.useMultipart = false;
		if(this.useMultipart)
			this.formData = new FormData();
		else
			this.formData = new Object();
		this.dataBlock = dataBlock;
		this.addData('dataBlock', dataBlock);
	}
	
	addData(name, value) {
		if(this.useMultipart)
			this.formData.append(name, value);
		else
			this.formData[name] = value;
	}
	
	addEventListener(name, func) {
		this.ajax.addEventListener(name, func);
	}
	
	send(sync) {
		this.ajax.open("POST", this.url, !sync);
		if(this.useMultipart) {
			this.ajax.send(this.formData);
		} else {
			this.ajax.setRequestHeader("Content-Type", "application/json");
			this.ajax.send(JSON.stringify(this.formData));
		}
	}
}