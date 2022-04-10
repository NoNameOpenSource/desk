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
		this.listeners = [];
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
		if(name == 'load' && func) {
			this.listeners.push(func);
		}
	}

	responseFromServer(evt) {
		if(evt.target.status == 200) {
			// .OK
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			} catch {
				var err = Object.freeze({ type: 0,
									   message: "Failed parse json",
									    detail: evt.target.responseText });
				this.callListeners(null, err);
			}
			this.callListeners(json, null);
		} else if(evt.target.status == 404) {
			// .notFound
			var err = Object.freeze({ message : "Failed to find file"});
			this.callListeners(null, err);
		} else if(evt.target.status == 400) {
			// .badRequest
			var err = Object.freeze({ message : "Server responsed with bad request"});
			this.callListeners(null, err);
		} else if(evt.traget.status == 500) {
			// .internalServerError
			var err = Object.freeze({ message : "Server responsed with internal server error"});
			this.callListeners(null, err);
		} else if(evt.target.status == 401) {
			// .unauthorized
			var err = Object.freeze({ message : "Server responsed with unauthorized request"});
			this.callListeners(null, err);
		} else {
			// .unknown error
			var err = Object.freeze({ message : "Unknown error occured"});
			this.callListeners(null, err);
		}
	}

	callListeners(response) {
		for(let listener of this.listeners) {
			listener(response);
		}
	}
	
	send(sync) {
		this.ajax.open("POST", this.url, !sync);
		this.ajax.addEventListener('load', this.responseFromServer.bind(this));
		if(this.useMultipart) {
			this.ajax.send(this.formData);
		} else {
			this.ajax.setRequestHeader("Content-Type", "application/json");
			this.ajax.send(JSON.stringify(this.formData));
		}
	}
}