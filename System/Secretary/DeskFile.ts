import { Secretary } from "./Secretary";

export class DeskFile {
    id: string;
    name: string;
    ext: string;
    type: string;
    data: any;
    owner: any;
    path: string;
    secretary: Secretary;
    location: string | number;

    constructor(id: any, name: string, type: string, owner?: any, data: any = null) {
        this.secretary = Secretary.getInstance();
        this.id = id;
        this.name = name;
        this.type = type;
        this.data = data;
        this.owner = owner;
        this.path;

        if (this.type === "BIN" || this.type === "PKG") {
            // getting extension if file
            const index = ((name.lastIndexOf(".") - 1) >>> 0) + 2;
            // @ts-ignore TODO: bug
            this.ext = name.slice(index);
            this.name = name.slice(0, index - 1);
        }
    }

    initFromPath(path: string) {
        this.path = path;
        const components = path.split("/");
        this.name = components[components.length - 1];
        this.type = null;
        this.data = null;
        this.owner = null;
    }

    static initWithFile(file: File) {
        const newFile = new DeskFile(file.id, file.name, file.type, file.ownerId, file.data);
        return newFile;
    }

    /**
     * Request server to get contents of file
     *
     * onCompletion errorType
     *     1 : server error
     *     2 : file does not exist
     *     3 : invalid location
     *
     * @param onCompletion callback function (error)
     * @returns
     */
    loadData(onCompletion: (errorType: ErrorType) => void) {
        if (!onCompletion) return;

        if (this.data) {
            onCompletion(null);
            return;
        }
        if (this.type !== "BIN") {
            const error = Object.freeze({ type: 1, message: "File is a directory" });
            onCompletion(error);
            return;
        }

        if (this.id !== null) {
            this.secretary.fileManager.loadFileDataWithId(this.id, (data: any, error: ErrorType) => {
                if (error) {
                    onCompletion(error);
                }
                this.data = data;
                onCompletion(null);
            });
        }
    }
}

interface File {
    id: string;
    name: string;
    type: string;
    ownerId: string;
    data: any;
}

type ErrorType = Readonly<{ type: number; message: string }>;
