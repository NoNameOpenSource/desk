import { DeskFile } from "./DeskFile";
import { DeskFileUpload } from "./DeskFileUpload";
import { RequestServer } from "./RequestServer";
import { Secretary } from "./Secretary";

export class FileManager {
    secretary: Secretary;

    constructor() {
        this.secretary = Secretary.getInstance();
    }

    get homeFolder() {
        const homeFolder = new DeskFile(0, "My Cloud", "DIR", this.secretary.currentUser.id);
        homeFolder.path = "~";
        return homeFolder;
    }

    get trashcan() {
        const trash = new DeskFile(1, "휴지통", "RCB", this.secretary.currentUser.id);
        trash.path = "~/.Trash";
        return trash;
    }

    // @ts-ignore
    // eslint-disable-next-line class-methods-use-this
    get networkFolder() {
        const network = new DeskFile(2, "네트워크", "NWK");
        network.path = "/Networks";
        return network;
    }

    // eslint-disable-next-line class-methods-use-this
    isHomeFolder(folder: DeskFile) {
        if (folder.id !== null) {
            if (folder.id === 0) return true;
            else return false;
        }
        const components = folder.path.split("/");
        if (components.length === 3) {
            if (components[1] === "Users") {
                return true;
            }
        }
        if (components.length === 4) {
            if (components[1] === "Users" && components[3] === "") {
                return true;
            }
        }
        return false;
    }

    // eslint-disable-next-line class-methods-use-this
    isSameFile(a: any, b: any) {
        if (a.id !== null) {
            return a.id === b.id;
        } else {
            return a.path === b.path;
        }
    }

    /**
     * Request server to get contents of file to load
     *
     * @todo maybe use RequestServer?
     *
     * @param fileId id of the file
     */
    loadFileDataWithId(fileId: string, onCompletion: (data: Blob, error: any) => void) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", this.secretary.urlForFileId(fileId));
        xhr.responseType = "blob";
        xhr.addEventListener("load", function (evt) {
            // @ts-ignore
            if (evt.target.status === 200) {
                // .OK
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                onCompletion(evt.target.response, null);
                // @ts-ignore
            } else if (evt.target.status === 404) {
                // .notFound
                const err = Object.freeze({ message: "Failed to find file" });
                onCompletion(null, err);
                // @ts-ignore
            } else if (evt.target.status === 400) {
                // .badRequest
                const err = Object.freeze({ message: "Server responded with bad request" });
                onCompletion(null, err);
                // @ts-ignore
            } else if (evt.traget.status === 500) {
                // .internalServerError
                const err = Object.freeze({ message: "Server responded with internal server error" });
                onCompletion(null, err);
                // @ts-ignore
            } else if (evt.target.status === 401) {
                // .unauthorized
                const err = Object.freeze({ message: "Server responded with unauthorized request" });
                onCompletion(null, err);
            } else {
                // .unknown error
                const err = Object.freeze({ message: "Unknown error occurred" });
                onCompletion(null, err);
            }
        });
        xhr.send();
    }

    /**
     * Request server to get contents of text file
     *
     * @todo maybe use RequestServer?
     *
     * @param fileId id of the file
     */
    loadFileTextWithId(fileId: string, onCompletion: (data: Blob, error: any) => void) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", this.secretary.urlForFileId(fileId));
        xhr.responseType = "text";
        xhr.addEventListener("load", function (evt) {
            // @ts-ignore
            if (evt.target.status === 200) {
                // .OK
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                onCompletion(evt.target.response, null);
                // @ts-ignore
            } else if (evt.target.status === 404) {
                // .notFound
                const err = Object.freeze({ message: "Failed to find file" });
                onCompletion(null, err);
                // @ts-ignore
            } else if (evt.target.status === 400) {
                // .badRequest
                const err = Object.freeze({ message: "Server responded with bad request" });
                onCompletion(null, err);
                // @ts-ignore
            } else if (evt.traget.status === 500) {
                // .internalServerError
                const err = Object.freeze({ message: "Server responded with internal server error" });
                onCompletion(null, err);
                // @ts-ignore
            } else if (evt.target.status === 401) {
                // .unauthorized
                const err = Object.freeze({ message: "Server responded with unauthorized request" });
                onCompletion(null, err);
            } else {
                // .unknown error
                const err = Object.freeze({ message: "Unknown error occurred" });
                onCompletion(null, err);
            }
        });
        xhr.send();
    }

    /**
     * Request server to get contents of the file in the folder
     * @param folderId id of folder in which to find file
     * @param fileName name of the file to find in the folder
     * @returns
     */
    loadFileInFolder(folderId: string, fileName: string, onCompletion: (file: Blob, error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("FileInFolder");
        req.addData("Folder", folderId);
        req.addData("File", fileName);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({ type: 1, message: "Failed to load file with following error from server", detail: responseErr.detail });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus === 0) {
                if (response.FileInFolder.status === 0) {
                    // file found
                    this.secretary.loadFileWithId(response.FileInFolder.file.id, onCompletion);
                } else if (response.FileInFolder.status == 1) {
                    // 404 not found!
                    const err = Object.freeze({ type: 2, message: "File does not exist" });
                }
            }
        });
        req.send();
    }

    /**
     * Request server to get list in folder
     *
     * @param folder DeskFile folder to list files
     * @returns
     */
    listInFolder(folder: any, onCompletion: (fileList: any, locationData: any, error: any) => void) {
        if (!onCompletion) return;
        if (folder.owner !== this.secretary.currentUser.id && this.isHomeFolder(folder)) {
            this.requestRemoteDrive(folder.owner, onCompletion);
            return;
        }
        const req = new RequestServer("FileList");
        req.addData("Path", folder.path);
        if (folder.id !== null && folder.id !== -1) {
            req.addData("Location", folder.id);
        }
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to load list data with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to load list data with data with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'FileList'",
                });
                onCompletion(null, null, err);
                return;
            }
            if (!response.FileList.Location) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to load list data with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, null, err);
                return;
            }
            response = response.FileList;
            const files = [];
            if (folder.id === 0) {
                // home folder
                // add networks and trash
                files.push(this.trashcan);
                files.push(this.networkFolder);
            }
            const location = DeskFile.initWithFile(response.Location);
            if (location.path === null) location.path = folder.path;

            let path = folder.path ? folder.path : location.path;
            if (path) {
                if (path[path.length - 1] === "/") {
                    path = path.slice(0, path.length - 1);
                }
            }
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < response.FileList.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const file = DeskFile.initWithFile(response.FileList[i]);
                if (path) file.path = path + "/" + file.name;
                files.push(file);
            }
            onCompletion(files, location, null);
        });
        req.send();
    }

    /**
     * get DeskFile by Path
     *
     * @param path path of the file
     * @returns
     */
    // eslint-disable-next-line class-methods-use-this
    getFileByPath(path: string, onCompletion: (file: DeskFile, error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("FileByPath");
        req.addData("Path", path);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({ type: 1, message: "Failed to get file with following error from server", detail: responseErr.detail });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to get file with data with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'FileByPath'",
                });
                onCompletion(null, err);
                return;
            }
            response = response.FileByPath;
            if (response.Error) {
                const errorCode = response.Error;
                if (errorCode === 1) {
                    // file does not exist
                    const err = Object.freeze({ type: 3, message: "File does not exist" });
                    onCompletion(null, err);
                    return;
                }
                if (errorCode === 2) {
                    // database error
                    const err = Object.freeze({ type: 1, message: "Failed to add new folder with database error from server" });
                    onCompletion(null, err);
                    return;
                }
                if (errorCode === 3) {
                    // permission is not given to view list
                    const err = Object.freeze({ type: 2, message: "Unauthorized request" });
                    onCompletion(null, err);
                    return;
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const file = DeskFile.initWithFile(response.File);
            file.path = path;
            onCompletion(file, null);
        });
        req.send();
    }

    /**
     * Request server to make new folder in a folder
     * @param folder DeskFile folder where the new folder will be created
     * @param folderName name of the folder to create
     * @param onCompletion callback function (addedFolderId, error)
     * @returns
     */
    // eslint-disable-next-line class-methods-use-this
    addFolder(folder: any, folderName: string, onCompletion: (addedFolderId: string, error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("AddDirectory");
        if (folder.id === 2) {
            const err = Object.freeze({ type: 3, message: "Can not create folder in this location" });
            onCompletion(null, err);
            return;
        }
        req.addData("Name", folderName);
        req.addData("Location", folder.id);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'AddDirectory'",
                });
                onCompletion(null, err);
                return;
            }
            response = response.AddDirectory;
            if (response.UpdateResult === 1) {
                // already same name exist
                const err = Object.freeze({ type: 2, message: "'" + folderName + "'이름이 이미 사용중 입니다." });
                onCompletion(null, err);
                return;
            }
            if (response.UpdateResult === 2) {
                // database error
                const err = Object.freeze({ type: 1, message: "Failed to add new folder with database error from server" });
                onCompletion(null, err);
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            onCompletion(response.FolderId, null);
        });
        req.send();
    }

    /**
     * Request server to get list in remote location
     * @param userId id of the owner of the drive to access
     * @param onCompletion callback function (fileList, locationData, error)
     * @returns
     */
    requestRemoteDrive(userId: any, onCompletion: (fileList: any[], locationData: any, error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("RemoteDrive");
        req.addData("UserId", userId);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to load list data with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to load list data with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'RemoteDrive'",
                });
                onCompletion(null, null, err);
                return;
            }
            response = response.RemoteDrive;
            if (response.UpdateResult === 1) {
                // remote location does not exist
                const err = Object.freeze({ type: 2, message: "Unauthorized request" });
                onCompletion(null, null, err);
                return;
            }
            if (response.UpdateResult === 2) {
                // database error
                const err = Object.freeze({ type: 1, message: "Failed to load list data with database error from server" });
                onCompletion(null, null, err);
                return;
            }
            if (response.UpdateResult === 3) {
                // permission is not given to view list
                const err = Object.freeze({ type: 2, message: "Unauthorized request" });
                onCompletion(null, null, err);
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const location = DeskFile.initWithFile(response.Location);
            location.path = this.networkFolder.path + "/" + location.name;
            const files = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < response.FileList.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const file = DeskFile.initWithFile(response.FileList[i]);
                file.path = location.path + "/" + file.name;
                files.push(file);
            }
            onCompletion(files, location, null);
        });
        req.send();
    }

    /**
     *
     * @param htmlFileObjects HTML file objects
     * @param onCompletion called for each file
     * @param onProgress called when progress updates for each file
     * @returns
     */
    uploadFiles(
        htmlFileObjects: File[],
        location: string,
        onCompletion: (file: DeskFile, error: any) => void,
        onProgress: (file: DeskFile, loaded: boolean, total: number) => void,
        altNames: string[]
    ) {
        if (!onCompletion) return;
        const names: string[] = [];
        for (let i = 0; i < htmlFileObjects.length; i++) {
            if (htmlFileObjects[i].size >= 4294967296) {
                // 4GB files
                // can't upload file bigger than 4GB
            } else {
                if (altNames) {
                    names.push(altNames[i]);
                } else {
                    names.push(htmlFileObjects[i].name);
                }
            }
        }
        // request server to get place to upload the files
        const req = new RequestServer("FileUploadRequest");
        req.addData("Location", location);
        req.addData("Names[]", names);

        // TODO: use fat arrow function instead of .bind(this)
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'FileUploadRequest'",
                });
                onCompletion(null, err);
                return;
            }
            response = response.FileUploadRequest;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const errors = [];
            for (let i = 0; i < response.fileIds.length; i++) {
                if (response.fileIds[i] < 0) {
                    // name already exist
                    const err = Object.freeze({ type: 2, message: "'" + names[i] + "'이름이 이미 사용중 입니다. 업로드에 실패하였습니다." });
                    onCompletion(null, err);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    const file = new DeskFileUpload(response.fileIds[i], names[i]);
                    file.location = location;
                    file.size = htmlFileObjects[i].size;
                    if (file.size < 1000000000)
                        // file approximately less than 1GB
                        // @ts-ignore
                        this.secretary.uploadFile(htmlFileObjects[i], file, onCompletion, onProgress);
                    // @ts-ignore TODO: bug
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    else this.secretary.uploadBigFile(htmlFileObjects[i], file, onCompletion, onProgress);
                }
            }
        });

        req.send();
    }

    /**
     * Rename given file
     * @param file DeskFile Object
     * @param name new name for the file
     * @param onCompletion callback function (error)
     * @returns
     */
    // eslint-disable-next-line class-methods-use-this
    renameFile(file: DeskFile, name: string, onCompletion: (error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("RenameFile");
        req.addData("Name", name);
        req.addData("File", file.id);
        req.addData("Type", file.type);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'RenameFile'",
                });
                onCompletion(err);
                return;
            }
            response = response.RenameFile;
            if (response.UpdateResult === 1) {
                // already same name exist
                const err = Object.freeze({
                    type: 2,
                    // @ts-ignore
                    message: "'" + folderName + "'이름이 이미 사용중 입니다.",
                });
                onCompletion(err);
                return;
            }
            onCompletion(null);
        });
        req.send();
    }

    /**
     * Create an empty file
     * @param name name for the file
     * @param folder folder to make blank file
     * @param onCompletion callback function (addedDeskFile, error)
     * @returns
     */
    // eslint-disable-next-line class-methods-use-this
    touch(name: string, folder: any, onCompletion: (addedDeskFile: DeskFile, errorType: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("AddBlankFile");
        req.addData("Name", name);
        req.addData("Location", folder.id);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'AddBlankFile'",
                });
                onCompletion(null, err);
                return;
            }
            response = response.AddBlankFile;
            if (response.UpdateResult === 1) {
                // already same name exist
                const err = Object.freeze({ type: 2, message: "'" + name + "'이름이 이미 사용중 입니다." });
                onCompletion(null, err);
                return;
            }
            const file = new DeskFile(response.FileId, name, "BIN");
            onCompletion(file, null);
        });
        req.send();
    }

    /**
     *
     * @param files DeskFile objects to copy
     * @param folder folder in which to paste the copy
     * @param onCompletion callback function (conflictedFiles, error)
     * @returns
     */
    // eslint-disable-next-line class-methods-use-this
    copyFiles(files: any[], folder: any, onCompletion: (conflictedFiles: any[], error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("CopyFiles");
        const fileIds = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < files.length; i++) {
            fileIds.push(files[i].id);
        }
        req.addData("FileList[]", fileIds);
        req.addData("Location", folder.id);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to copy files with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to copy files with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'CopyFiles'",
                });
                onCompletion(null, err);
                return;
            }
            response = response.CopyFiles;
            if (response.UpdateResult === 1) {
                // already same name exist
                const err = Object.freeze({ type: 2, message: "Can not copy files into this location" });
                onCompletion(null, err);
                return;
            }
            if (response.UpdateResult === 2) {
                // database error
                const err = Object.freeze({ type: 1, message: "Failed to copy files with database error from server" });
                onCompletion(null, err);
                return;
            }
            // check conflicted files
            const conflictedFiles = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < response.ConflictFiles.length; i++) {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let j = 0; j < files.length; j++) {
                    if (files[j].name === response.ConflictFiles[i].name) {
                        conflictedFiles.push(files[j]);
                        break;
                    }
                }
            }
            onCompletion(conflictedFiles, null);
        });
        req.send();
    }

    /**
     * Move files
     *
     * @param files DeskFile objects to move
     * @param folder folder to paste the move
     * @param onCompletion callback function (conflictedFiles, error)
     */
    // eslint-disable-next-line class-methods-use-this
    moveFiles(files: any[], folder: any, onCompletion: (conflictedFiles: any[], error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("MoveFiles");
        const fileIds = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < files.length; i++) {
            fileIds.push(files[i].id);
        }
        req.addData("FileList[]", fileIds);
        req.addData("Location", folder.id);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to move files with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(null, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to move files with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'MoveFiles'",
                });
                onCompletion(null, err);
                return;
            }
            response = response.MoveFiles;
            if (response.UpdateResult === 1) {
                // already same name exist
                const err = Object.freeze({ type: 2, message: "Can not move the files into this location" });
                onCompletion(null, err);
                return;
            }
            if (response.UpdateResult === 2) {
                // database error
                const err = Object.freeze({ type: 1, message: "Failed to move files with database error from server" });
                onCompletion(null, err);
                return;
            }
            // check conflicted files
            const conflictedFiles = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < response.ConflictFiles.length; i++) {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let j = 0; j < files.length; j++) {
                    if (files[j].name === response.ConflictFiles[i].name) {
                        conflictedFiles.push(files[j]);
                        break;
                    }
                }
            }
            onCompletion(conflictedFiles, null);
        });
        req.send();
    }

    /**
     * Move files
     *
     * @param files DeskFile objects to throw into trash can
     * @param onCompletion callback function (errorType)
     */
    // eslint-disable-next-line class-methods-use-this
    trashFiles(files: any[], onCompletion: (error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("TrashFiles");
        const fileIds = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < files.length; i++) {
            fileIds.push(files[i].id);
        }
        req.addData("FileList[]", fileIds);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to trash files with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to trash files with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'TrashFiles'",
                });
                onCompletion(err);
                return;
            }
            // json = json.TrashFiles;
            onCompletion(null);
        });
        req.send();
    }

    /**
     * Delete files
     *
     * @param files DeskFile objects to delete
     * @param onCompletion callback function (error)
     */
    // eslint-disable-next-line class-methods-use-this
    deleteFiles(files: any[], onCompletion: (error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("DeleteFiles");
        const fileIds = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < files.length; i++) {
            fileIds.push(files[i].id);
        }
        req.addData("FileList[]", fileIds);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to delete files with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to delete files with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'DeleteFiles'",
                });
                onCompletion(err);
                return;
            }
            response = response.DeleteFiles;
            if (response.UpdateResult === 2) {
                // database error
                const err = Object.freeze({ type: 1, message: "Failed to delete files with database error from server" });
                onCompletion(err);
                return;
            }
            onCompletion(null);
        });
        req.send();
    }
}
