class DeskFile {
	constructor(id, name, type, owner, data = null) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.data = data;
		this.owner = owner;
		this.path;

		if(this.type == "BIN" || this.type == "PKG") {
			// getting extension if file
			var index = (name.lastIndexOf(".") - 1 >>> 0) + 2;
			this.ext = name.slice(index);
			this.name = name.slice(0, index - 1);
		}
	}

	static initFromPath(path) {
		this.path = path;
		var components = path.split('/');
		this.name = components[components.length - 1];
		this.type = null;
		this.data = null;
		this.owner = null;
	}

	static initWithFile(file) {
		var newFile = new DeskFile(file.id, file.name, file.type, file.ownerId, file.data);
		return newFile;
	}

	/*
	** Request server to get contents of file
	** 
	** parameters
	**	-onCompletion	: callback function (error)
	** 
	** errorType
	** 	1 : server error
	**	2 : file does not exist
	**	3 : invalid location
	**
	*/
	loadData(onCompletion) {
		if(!onCompletion)
			return;

		if(this.data) {
			onCompletion(null);
			return;
		}
		if(this.type != "BIN") {
			let error = Object.freeze({ type : 1,
									 message : "File is a directory" });
			onCompletion(err);
			return;
		}

		if(this.id != null) {
			Secretary.fileManager.loadFileDataWithId(this.id, function(data, error) {
				if(error) {
					onCompletion(error);
				}
				this.data = data;
				onCompletion(null);
			}.bind(this));
		}
	}
}