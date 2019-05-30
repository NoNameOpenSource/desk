class DeskFileUpload extends DeskFile {
	constructor(id, name) {
		super(id, name, 'UPD', null);
		this._progress = 0;
		this.size = 0;
	}

	didFinishUpload() {
	}

	set progress(newValue) {
		this._progress = newValue;
	}

	get progress() {
		return this._progress;
	}
}