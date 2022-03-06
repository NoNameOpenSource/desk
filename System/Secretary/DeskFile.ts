import { Secretary } from "./Secretary";

export class DeskFile {
    id: any;
    name: any;
    type: any;
    data: any;
    owner: any;
    path: any;
    secretary: Secretary;

    constructor(id, name, type, owner?, data = null) {
        this.secretary = Secretary.getInstance();
        this.id = id;
        this.name = name;
        this.type = type;
        this.data = data;
        this.owner = owner;
        this.path;

        if (this.type == "BIN" || this.type == "PKG") {
            // getting extension if file
            var index = ((name.lastIndexOf(".") - 1) >>> 0) + 2;
			// @ts-ignore TODO: bug
            this.ext = name.slice(index);
            this.name = name.slice(0, index - 1);
        }
    }

    initFromPath(path) {
        this.path = path;
        var components = path.split("/");
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
        if (!onCompletion) return;

        if (this.data) {
            onCompletion(null);
            return;
        }
        if (this.type != "BIN") {
            let error = Object.freeze({ type: 1, message: "File is a directory" });
			// @ts-ignore TODO: maybe error?
            onCompletion(err);
            return;
        }

        if (this.id != null) {
            this.secretary.fileManager.loadFileDataWithId(
                this.id,
                function (data, error) {
                    if (error) {
                        onCompletion(error);
                    }
                    this.data = data;
                    onCompletion(null);
                }.bind(this)
            );
        }
    }
}
