import { Desk } from "../Desk/Desk";
import { DeskFile } from "./DeskFile";
import { FileManager } from "./FileManager";
import { RequestServer } from "./RequestServer";
import { WorkSpace } from "./WorkSpace";

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
    private static instance: Secretary;

    applications = new Array();
    windows = new Array();
    serverProtocol = "";
    serverName = "";
    version = "";
    getVariables = new Object();
    serverType = "";
    dataManagerURL = "";
    workSpaces = new Array();
    mainWorkSpace: any = null;
    plugins = new Object();
    pluginFrames = new Array();
    uploads = new Array();
    currentUser: any;
    users = new Array();
    browser;
    browserVersion = "0";
    ESVersion;
    appList = new Array();
    clipboard: any;
    desk: Desk;
    fileManager = new FileManager();

    secretaryInstance: Secretary;
    user: any;

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(): Secretary {
        if (!Secretary.instance) {
            Secretary.instance = new Secretary();
        }

        return Secretary.instance;
    }

    private constructor() {
        this.desk = Desk.getInstance();
        this.secretaryInstance = Secretary.getInstance();

        // Init based on the server
        if (this.serverType == "php") {
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
    }

    loadUserInfo() {
        let req = new RequestServer("UserInfo");
        req.addEventListener("load", function (response, err) {
            if (err) {
                // TODO: maybe just err instead of err.detail?
                Secretary.getInstance().alertError("Failed to load UserInfo with following error from server:", err.detail);
                return -1;
            }
            if (response.DataBlockStatus == 0) {
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
        this.desk.workSpaceDock.update();
    }

    quitWorkSpace(index: number) {
        var name = this.workSpaces[index].name;
        var icon = this.workSpaces[index].icon.imageSource;
        var appList = this.workSpaces[index].appList;
        this.workSpaces[index].delete();
        this.workSpaces[index] = new WorkSpace(name, icon, appList);
    }

    /**
     * @todo Secretary should not know about the specific applications
     */
    static loadApp(appName: string, appSetting: any, workSpace: any) {
        if (appName == "Terminal") {
            // @ts-ignore
            return new Terminal(workSpace, appName, appSetting);
        } else if (appName == "TextEditor") {
            // @ts-ignore
            return new TextEditor(workSpace, appName, appSetting);
        } else if (appName == "DocReader") {
            // @ts-ignore
            return new DocReader(workSpace, appName, appSetting);
        } else if (appName == "Debugger") {
            // @ts-ignore
            return new Debugger(workSpace, appName, appSetting);
        }
    }

    /**
     * @todo finish or remove this function
     */
    loadScripts(appName: string) {}

    setClipboard(clipboard: any) {
        if (this.clipboard) {
            this.clipboard.delete();
            this.clipboard = null;
        }
        this.clipboard = clipboard;
    }

    getClipboard(dataType: any) {
        if (this.clipboard) {
            return this.clipboard.getData(dataType);
        } else return false;
    }

    loadAppList() {
        this.appList;
        const req = new RequestServer("ProgramList");
        req.addEventListener("load", function (response, err) {
            if (err) {
                // the system errors should be handled with a new way
                // TODO: maybe just err instead of err.detail?
                Secretary.getInstance().alertError("Failed to load ProgramList with following error from server:", err.detail);
                return -1;
            }
            if (response.DataBlockStatus == 0) {
                Secretary.getInstance().appList = response.ProgramList;
            }

            // reload desk menu
            Desk.getInstance().deskMenu.reloadData();
        });
        req.send();
    }

    loadWorkSpaces() {
        const req = new RequestServer("WorkSpaces");
        req.addEventListener("load", function (response, err) {
            if (err) {
                // the system errors should be handled with a new way
                // TODO: maybe just err instead of err.detail?
                Secretary.getInstance().alertError("Failed to load WorkSpaces with following error from server:", err.detail);
                return -1;
            }
            if (response.DataBlockStatus == 0) {
                var i = 0;
                for (; i < response.WorkSpaces.length; i++) {
                    var tmpWS = new WorkSpace(
                        response.WorkSpaces[i].name,
                        "/System/Secretary/AppIcon/".concat(response.WorkSpaces[i].icon, ".png"),
                        response.WorkSpaces[i].apps,
                        response.WorkSpaces[i].settings
                    );
                    Secretary.getInstance().workSpaces.push(tmpWS);
                }
            }

            // Set first work space as main space
            Secretary.getInstance().setMainWorkSpace(Secretary.getInstance().workSpaces[0]);
        });
        req.send();
    }

    loadPlugins() {
        // MathJax
        var idx = this.pluginFrames.push(document.createElement("IFRAME")) - 1;
        var mathJaxFrame = this.pluginFrames[idx];
        mathJaxFrame.setAttribute("src", "/System/Plugins/MathJax.html");
        mathJaxFrame.onload = () => {
            // @ts-ignore TODO: proper MathJax import
            this.plugins.MathJax = mathJaxFrame.contentWindow.MathJax;
            // @ts-ignore TODO: proper MathJax import
            this.plugins.MathJax.buffer = mathJaxFrame.contentWindow.document.getElementById("buffer");
        };
        this.desk.addPluginFrame(mathJaxFrame);
        mathJaxFrame.style.display = ""; // MathJax does not work with 'display: none'
        mathJaxFrame.style.position = "absolute";
        mathJaxFrame.style.left = "100%";
        mathJaxFrame.style.top = "100%";
        // Tesseract.js
        idx = this.pluginFrames.push(document.createElement("IFRAME")) - 1;
        var tesseractFrame = this.pluginFrames[idx];
        tesseractFrame.setAttribute("src", "/System/Plugins/Tesseract.js.html");
        tesseractFrame.onload = () => {
            // @ts-ignore TODO: proper Tesseract import
            this.plugins.Tesseract = tesseractFrame.contentWindow.Tesseract;
        };
        this.desk.addPluginFrame(tesseractFrame);
        // pdf.js
        idx = this.pluginFrames.push(document.createElement("IFRAME")) - 1;
        var pdfFrame = this.pluginFrames[idx];
        pdfFrame.setAttribute("src", "/System/Plugins/pdf.js.html");
        pdfFrame.onload = () => {
            // @ts-ignore TODO: proper pdfjs import
            this.plugins.PDFJS = pdfFrame.contentWindow.pdfjsLib;
        };
        this.desk.addPluginFrame(pdfFrame);
    }

    checkESVersion() {
        try {
            const objects = { Gibson: "Les Paul", Fender: "Stratocaster" };
            if (Object.values(objects)[0] == "Les Paul") return 8;
        } catch (e) {}

        try {
            var x = 0;
            x = 3 ** 4;
            if (x == 81) return 7;
        } catch (e) {}

        // the minimum supported version of this program is 6
        // so assume the current version is at least 6
        return 6;
    }

    checkBrowser() {
        type Browser = {
            name: string;
            version: string;
        };
        let browser = <Browser>{};
        if (navigator.userAgent.indexOf("Chrome") != -1) {
            browser.name = "Chrome";
        } else if (navigator.userAgent.indexOf("Safari") != -1) {
            browser.name = "Safari";
        } else if (navigator.userAgent.indexOf("Firefox") != -1) {
            if (navigator.userAgent.indexOf("Seamonkey") == -1) browser.name = "Firefox";
        } else if (navigator.userAgent.indexOf("Opera") != -1) {
            browser.name = "Opera";
        }

        if (!browser.name) {
            browser.name = "unknown browser";
            return browser;
        }

        var index = navigator.userAgent.indexOf(browser.name);
        var versionStr = navigator.userAgent.slice(index + browser.name.length + 1);
        index = versionStr.indexOf(" ");
        if (index == -1) {
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
        if (typeof file == "number") {
            return this.urlForFileId(file);
        }
        if (file.id) {
            return this.urlForFileId(file.id);
        }
        var components = file.path.split("/");
        if (components[0] == "~") {
            // user directory
        } else {
            if (components[1] == "Networks") {
                // user directory
            } else {
                // system (root) directory
                return file.path;
            }
        }
    }

    urlForFileId(fileId: any) {
        if (this.serverType == "php") {
            return "/system/DataManager/DownloadBIN.php?file=".concat(fileId);
        } else {
            return "/System/DownloadBIN?file=".concat(fileId);
        }
    }

    urlForStream(fileId: string) {
        if (this.serverType == "php") {
            return "/system/DataManager/Stream.php?file=".concat(fileId);
        } else {
            return "/System/Stream?file=".concat(fileId);
        }
    }

    loadFileWithId(fileId: any, onCompletion: (data: Blob, error: any) => void, sync?: boolean) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.urlForFile(fileId), !sync);
        xhr.addEventListener("load", function (evt) {
            // @ts-ignore
            if (evt.target.status == 200) {
                // .OK
                // @ts-ignore
                onCompletion(evt.target.response);
                // @ts-ignore
            } else if (evt.target.status == 404) {
                // .notFound
                // @ts-ignore
            } else if (evt.target.status == 400) {
                // .badRequest
                // @ts-ignore
            } else if (evt.traget.status == 500) {
                // .internalServerError
                // @ts-ignore
            } else if (evt.target.status == 401) {
                // .unauthorized
            } else {
                // .unknown error
            }
        });
        xhr.send();
    }

    loadFileInFolder(folderId: any, fileName: string, onCompletion: (data: Blob, error: any) => void) {
        if (!onCompletion) return;
        var req = new RequestServer("FileInFolder");
        req.addData("Folder", folderId);
        req.addData("File", fileName);
        req.addEventListener("load", (response, responseErr) => {
            if (responseErr) {
                let err = Object.freeze({ titleText: "Failed to load file with following error from server:", errMsg: responseErr.detail });
                onCompletion(null, err);
                return -1;
            }
            if (response.DataBlockStatus == 0) {
                if (response.FileInFolder.status == 0) {
                    // file found
                    this.loadFileWithId(response.FileInFolder.file.id, onCompletion);
                } else if (response.FileInFolder.status == 1) {
                    // 404 not found!
                    let err = Object.freeze({ titleText: "File does not exist" });
                }
            }
        });
        req.send();
    }

    /**
     * @todo remove or use this function
     */
    loadFileWithPath(path: string, onCompletion: () => void) {}

    openDrawer(option: { drawerType: string }) {
        option.drawerType = "openPanel";
        var drawer = Secretary.loadApp("Drawer", option, null);
    }

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
        htmlFileObject: any,
        file: any,
        onCompletion: (file: DeskFile, error: any) => void,
        onProgress: (file: DeskFile, loaded: boolean, total?: number) => void
    ) {
        var req = new RequestServer("FileUpload", true);
        req.addData("File", htmlFileObject);
        req.addData("FileId", file.id);
        this.uploads.push(file);
        req.addEventListener("load", (response, responseErr) => {
            file.didFinishUpload();
            var index = this.uploads.indexOf(file);
            this.uploads.splice(index, 1);
            // Analysis received data
            if (responseErr) {
                var err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: responseErr.detail,
                });
                onCompletion(file, err);
                return;
            }
            if (response.DataBlockStatus != 0) {
                const err = Object.freeze({
                    type: 1,
                    message: "Failed to add new folder with following error from server",
                    detail: "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'FileUpload'",
                });
                onCompletion(file, err);
                return;
            }
            response = response.FileUpload;
            if (response.UpdateResult != 0) {
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
                let ext = file.name.match(/\.[^\.]+$/)[0];
                file.ext = ext.slice(1);
                file.name = name.slice(0, name.length - 1);
            }
            onCompletion(file, null);
        });

        // Progress handler
        req.ajax.upload.addEventListener("progress", function (evt) {
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
    getUserInfo = function (userId: string, onCompletion: (errorType: number) => void) {};
}

type File = {
    id: number;
    path: string;
    name: string;
    progress: number;
    ext: string;
};
