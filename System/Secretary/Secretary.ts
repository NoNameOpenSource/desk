import { DIWindow } from "../Desk";
import { Desk } from "../Desk/Desk";
import { Application } from "./Application";
import { DeskClipboard } from "./DeskClipboard";
import { DeskFile } from "./DeskFile";
import { DeskFileUpload } from "./DeskFileUpload";
import { FileManager } from "./FileManager";
import { RequestServer } from "./RequestServer";
import { User } from "./User";
import { WorkSpace } from "./WorkSpace";

/** Singleton */
export let instance: Secretary;

/**
 * 생성자
 *
 * Singleton.
 *
 * -dataBaseType	: 데이터베이스로 사용될 프로그램의 종류
 *      -MySQL	: 1
 *
 * @todo use fetch api throughout
 */
export class Secretary {
    applications: Application[] = [];
    windows: DIWindow[] = [];
    serverProtocol = "";
    serverName = "";
    version = "";
    getVariables = new Object();
    serverType = "";
    dataManagerURL = "";
    workSpaces: WorkSpace[] = [];
    mainWorkSpace: WorkSpace = null;
    plugins = new Object();
    pluginFrames: any[] = [];
    uploads: any[] = [];
    currentUser: any;
    users: User[] = [];
    browser;
    browserVersion = "0";
    ESVersion;
    appList: string[] = [];
    clipboard: DeskClipboard;
    desk: Desk;
    fileManager = new FileManager();
    /** @todo use enum */
    clientMode: string;
    application: string;

    secretaryInstance: Secretary;
    user: any;

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance() {
        if (!instance) {
            instance = new Secretary();
        }

        return instance;
    }

    private constructor() {
        this.desk = Desk.getInstance();
        this.secretaryInstance = Secretary.getInstance();

        // Init based on the server
        if (this.serverType === "php") {
            this.dataManagerURL = "/System/DataManager/DataManager.php";
        } else {
            this.dataManagerURL = "/System/DataManager";
        }

        // Detect Browser
        this.browser = this.checkBrowser();

        // Detect ECMAScript Version
        this.ESVersion = this.checkESVersion();

        // Load UserInfo
        this.loadUserInfo();

        // Load WorkSpaces
        this.loadWorkSpaces();

        // load plugins
        this.loadPlugins();

        // load side menu app list
        this.loadAppList();

        if (this.secretaryInstance.clientMode === "SingleApplication") {
            this.desk.hideTopMenuBar();
            this.desk.hideWorkSpaceDock();
            this.desk.hideWallpaper();
            this.desk.body.body.style.transition = "none";
            this.workSpaces[0].fullScreen(this.workSpaces[0].apps[0].window);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    loadUserInfo() {
        const req = new RequestServer("UserInfo");
        req.addEventListener("load", function (response, err) {
            if (err) {
                // TODO: maybe just err instead of err.detail?
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                Secretary.getInstance().alertError("Failed to load UserInfo with following error from server:", err.detail);
                return -1;
            }
            if (response.DataBlockStatus === 0) {
                Secretary.getInstance().user = response.UserInfo;
            }
        });
        req.send();
    }

    setMainWorkSpace(workSpace: WorkSpace) {
        if (this.secretaryInstance.mainWorkSpace) {
            this.secretaryInstance.mainWorkSpace.putInSleep();
        }
        workSpace.wakeUp();
        this.secretaryInstance.mainWorkSpace = workSpace;
        this.desk.body.unplugChildViews();
        this.desk.body.addChildView(this.secretaryInstance.mainWorkSpace.body);
        // Update dock
        // eslint-disable-next-line node/prefer-global/console
        this.desk.workSpaceDock.update().catch(console.error);
    }

    quitWorkSpace(index: number) {
        const name = this.workSpaces[index].name;
        const icon = this.workSpaces[index].icon.imageSource;
        const appList = this.workSpaces[index].appList;
        this.workSpaces[index].delete();
        this.workSpaces[index] = new WorkSpace(name, icon, appList);
    }

    /**
     * @todo Secretary should not know about the specific applications
     */
    static loadApp(appName: string, appSetting: any, workSpace: WorkSpace) {
        if (appName === "Terminal") {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const app: Application = new Terminal(workSpace, appName, appSetting);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return app;
        } else if (appName === "TextEditor") {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const app: Application = TextEditor(workSpace, appName, appSetting);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return app;
        } else if (appName === "DocReader") {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const app: Application = DocReader(workSpace, appName, appSetting);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return app;
        } else if (appName === "Debugger") {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const app: Application = new Debugger(workSpace, appName, appSetting);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return app;
        } else if (appName === "BeatApp") {
            // @ts-ignore TODO: BeatApp does not exist
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const app: Application = new BeatApp(workSpace, appName, appSetting);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return app;
        }
    }

    /**
     * @todo finish or remove this function
     */
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    loadScripts(appName: string) {}

    setClipboard(clipboard: any) {
        if (this.clipboard) {
            this.clipboard.delete();
            this.clipboard = null;
        }
        this.clipboard = clipboard;
    }

    getClipboard(dataType: string) {
        if (this.clipboard) {
            return this.clipboard.getData(dataType);
        } else return false;
    }

    loadAppList() {
        this.appList;

        if (this.secretaryInstance.clientMode === "SingleApplication") {
            this.secretaryInstance.appList = [this.secretaryInstance.application];
            return;
        }

        const req = new RequestServer("ProgramList");
        req.addEventListener("load", function (response, err) {
            if (err) {
                // the system errors should be handled with a new way
                // TODO: maybe just err instead of err.detail?
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                Secretary.getInstance().alertError("Failed to load ProgramList with following error from server:", err.detail);
                return -1;
            }
            if (response.DataBlockStatus === 0) {
                Secretary.getInstance().appList = response.ProgramList;
            }

            // reload desk menu
            Desk.getInstance().deskMenu.reloadData();
        });
        req.send();
    }

    loadWorkSpaces() {
        if (this.secretaryInstance.clientMode === "SingleApplication") {
            const workSpace = new WorkSpace("main", null, [this.secretaryInstance.application], []);
            this.secretaryInstance.workSpaces.push(workSpace);
            this.secretaryInstance.setMainWorkSpace(this.secretaryInstance.workSpaces[0]);
            const app: Application = this.secretaryInstance.workSpaces[0].apps[0];
            const resize = () => {
                const width = window.innerWidth;
                //const height = window.innerHeight;

                //app.resize(width, height);
                app.resizeWidth(width);
            };
            window.addEventListener("resize", resize);
            resize();
            return;
        }

        const req = new RequestServer("WorkSpaces");
        req.addEventListener("load", (response, err) => {
            if (err) {
                // the system errors should be handled with a new way
                // TODO: maybe just err instead of err.detail?
                this.secretaryInstance.alertError("Failed to load WorkSpaces with following error from server:", <string>err.detail);
                return -1;
            }
            if (response.DataBlockStatus === 0) {
                let i = 0;
                for (; i < response.WorkSpaces.length; i++) {
                    const tmpWS = new WorkSpace(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        response.WorkSpaces[i].name,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        "/System/Secretary/AppIcon/".concat(response.WorkSpaces[i].icon, ".png"),
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        response.WorkSpaces[i].apps,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        response.WorkSpaces[i].settings
                    );
                    this.secretaryInstance.workSpaces.push(tmpWS);
                }
            }

            // Set first work space as main space
            this.secretaryInstance.setMainWorkSpace(this.secretaryInstance.workSpaces[0]);
        });
        req.send();
    }

    // eslint-disable-next-line class-methods-use-this
    loadPlugins() {}

    // eslint-disable-next-line class-methods-use-this
    checkESVersion() {
        try {
            const objects = { Gibson: "Les Paul", Fender: "Stratocaster" };
            if (Object.values(objects)[0] === "Les Paul") return 8;
        } catch (e) {}

        try {
            let x = 0;
            x = 3 ** 4;
            if (x === 81) return 7;
        } catch (e) {}

        // the minimum supported version of this program is 6
        // so assume the current version is at least 6
        return 6;
    }

    // eslint-disable-next-line class-methods-use-this
    checkBrowser() {
        type Browser = {
            name: string;
            version: string;
        };
        const browser = <Browser>{};
        if (navigator.userAgent.indexOf("Chrome") !== -1) {
            browser.name = "Chrome";
        } else if (navigator.userAgent.indexOf("Safari") !== -1) {
            browser.name = "Safari";
        } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
            if (navigator.userAgent.indexOf("Seamonkey") === -1) browser.name = "Firefox";
        } else if (navigator.userAgent.indexOf("Opera") !== -1) {
            browser.name = "Opera";
        }

        if (!browser.name) {
            browser.name = "unknown browser";
            return browser;
        }

        let index = navigator.userAgent.indexOf(browser.name);
        let versionStr = navigator.userAgent.slice(index + browser.name.length + 1);
        index = versionStr.indexOf(" ");
        if (index === -1) {
            index = versionStr.length;
        }
        versionStr = versionStr.slice(0, index);
        browser.version = versionStr;
        return browser;
    }

    alertError(titleText: string, errorMsg: string, func?: () => void) {
        this.desk.alertError(titleText, errorMsg, func);
    }

    urlForFile(file: File | number) {
        if (typeof file === "number") {
            return this.urlForFileId(file);
        }
        if (file.id) {
            return this.urlForFileId(file.id);
        }
        const components = file.path.split("/");
        if (components[0] === "~") {
            // user directory
        } else {
            if (components[1] === "Networks") {
                // user directory
            } else {
                // system (root) directory
                return file.path;
            }
        }
    }

    urlForFileId(fileId: any) {
        if (this.serverType === "php") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return "/system/DataManager/DownloadBIN.php?file=".concat(fileId);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return "/System/DownloadBIN?file=".concat(fileId);
        }
    }

    urlForStream(fileId: any) {
        if (this.serverType === "php") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return "/system/DataManager/Stream.php?file=".concat(fileId);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return "/System/Stream?file=".concat(fileId);
        }
    }

    loadFileWithId(fileId: any, onCompletion: (data: Blob, error: any) => void, sync?: boolean) {
        const xhr = new XMLHttpRequest();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        xhr.open("GET", this.urlForFile(fileId), !sync);
        xhr.addEventListener("load", function (evt) {
            // @ts-ignore
            if (evt.target.status === 200) {
                // .OK
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                onCompletion(evt.target.response);
                // @ts-ignore
            } else if (evt.target.status === 404) {
                // .notFound
                // @ts-ignore
            } else if (evt.target.status === 400) {
                // .badRequest
                // @ts-ignore
            } else if (evt.traget.status === 500) {
                // .internalServerError
                // @ts-ignore
            } else if (evt.target.status === 401) {
                // .unauthorized
            } else {
                // .unknown error
            }
        });
        xhr.send();
    }

    loadFileInFolder(folderId: any, fileName: string, onCompletion: (data: Blob, error: any) => void) {
        if (!onCompletion) return;
        const req = new RequestServer("FileInFolder");
        req.addData("Folder", folderId);
        req.addData("File", fileName);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                const err = Object.freeze({ titleText: "Failed to load file with following error from server:", errMsg: responseErr.detail });
                onCompletion(null, err);
                return -1;
            }
            if (response.DataBlockStatus === 0) {
                if (response.FileInFolder.status === 0) {
                    // file found
                    this.loadFileWithId(response.FileInFolder.file.id, onCompletion);
                } else if (response.FileInFolder.status === 1) {
                    // 404 not found!
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const err = Object.freeze({ titleText: "File does not exist" });
                }
            }
        });
        req.send();
    }

    /**
     * @todo remove or use this function
     */
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    loadFileWithPath(path: string, onCompletion: () => void) {}

    // eslint-disable-next-line class-methods-use-this
    openDrawer(option: { drawerType: string }) {
        option.drawerType = "openPanel";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const drawer = Secretary.loadApp("Drawer", option, null);
    }

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    receivedMessageFromServer(message: string) {}

    /**
     * Upload file to the server
     *
     * @param htmlFileObject HTML file object
     * @param file DeskFileUpload object
     * @param onCompletion callback function
     * @param onProgress callback function
     *
     * errorType
     *  	1 : server error
     */
    uploadFile(
        htmlFileObject: File,
        file: DeskFileUpload,
        onCompletion: (file: DeskFile, error: any) => void,
        onProgress: (file: DeskFile, loaded: number, total?: number) => void
    ) {
        const req = new RequestServer("FileUpload", true);
        req.addData("File", htmlFileObject);
        req.addData("FileId", file.id);
        this.uploads.push(file);
        req.addEventListener("load", (response, responseErr) => {
            file.didFinishUpload();
            const index = this.uploads.indexOf(file);
            this.uploads.splice(index, 1);
            // Analysis received data
            if (responseErr) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(file, err);
                return;
            }
            if (response.DataBlockStatus !== 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'FileUpload'",
                });
                onCompletion(file, err);
                return;
            }
            response = response.FileUpload;
            if (response.UpdateResult !== 0) {
                // file did not uploaded with an error
                const err = Object.freeze({
                    type: response.UpdateResult + 2,
                    // @ts-ignore TODO: fix fileName
                    message: "Failed to upload file '" + fileName + "' (Error Code: " + (response.UpdateResult + 2) + ")",
                });
                onCompletion(file, err);
                return;
            }
            let name = file.name.match(/.+\./)[0];
            if (!name) {
                name = file.name;
            } else {
                const ext = file.name.match(/\.[^\.]+$/)[0];
                file.ext = ext.slice(1);
                file.name = name.slice(0, name.length - 1);
            }
            onCompletion(file, null);
        });

        // Progress handler
        req.ajax.upload.addEventListener("progress", function (evt) {
            // eslint-disable-next-line node/prefer-global/console
            console.log(`progress event called with ${evt.loaded} / ${evt.total}`);
            file.progress = evt.loaded / evt.total;
            if (onProgress) {
                onProgress(file, file.progress);
            }
        });
        req.send();
    }

    /**
     * Get user info by user id
     *
     * @param userId id of the user of which to get info
     * @param onCompletion callback function (User, error)
     *
     * @todo finish or remove this function
     *
     * errorType
     *  1 : server error
     */
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    getUserInfo(userId: string, onCompletion: (errorType: number) => void) {}
}

type File = {
    id: number;
    path: string;
    name: string;
    progress: number;
    ext: string;
};
