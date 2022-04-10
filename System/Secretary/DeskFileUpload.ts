class DeskFileUpload extends DeskFile {
	constructor(id, name) {
		super(id, name, 'UPD', null);
		this._progress = 0.0;
		this.size = 0;
		this.listeners = [];
	}

	listen(callback) {
		this.listeners.push(callback);
	}

	didFinishUpload() {
		this.progress = 1.0;
		this.listeners = [];
	}

	set progress(newValue) {
		this._progress = newValue;
		for(let callback in this.listeners) {
			callback(this, this.progress);
		}
	}

	get progress() {
		return this._progress;
	}
}