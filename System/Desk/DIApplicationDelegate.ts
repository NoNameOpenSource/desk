class DIApplicationDelegate {
	constructor() {
	}
	
	init(app) {
		if(app) {
			this._app = app;
			this.errorHandler = app.errorHandler;
		}
		this.serverScriptLocation = "/Applications/".concat(this._app.appName,"/Contents/");
		if(Secretary.serverType == "php")
			this.serverScriptLocation = this.serverScriptLocation.concat("PHP/");
	}
	
	serverScript(str) {
		return this.serverScriptLocation.concat(str);
	}
}