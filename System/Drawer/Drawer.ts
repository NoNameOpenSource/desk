import { Desk, DIAlertView, DIButton, DIDragListView, DIImageView, DILabel, DIListViewCell, DITextField, DIView } from "../Desk";
import {
    Application,
    DeskClipboard,
    DeskEventInfo,
    DeskEventManager,
    DeskFile,
    FileManager,
    JsonMap,
    RequestServer,
    Secretary,
    WorkSpace,
} from "../Secretary";
import { DrawerListViewCell } from "./DrawerListViewCell";
import { DrawerUploadViewCell } from "./DrawerUploadViewCell";

interface DrawerData {
    selectedFiles: any[];
    studentId: number;
    studentName: string;
}
interface DataInfo {
    FileLocation: any;
    FileId: any;
    oldName: string;
    FileName: string;
    FileType: string; // todo make enum
}

interface CurrentAnimationInfo {
    oldViewElement: Element;
    deskEventInfo: DeskEventInfo;
}

export class Drawer extends Application {
    data: DrawerData;
    listViewContainer: DIView;
    drawerType: number;
    listNavigator: DIView;
    listBackButton: DIButton;
    listAddButton: DIButton;
    uploadButton: DIButton;
    searchView: DIView;
    searchField: DITextField;
    searchImage: DIImageView;
    searchLocation: string;
    listView: any;
    listViewIndex: any;
    listViewTitles: string[];
    listViewDepth: number;
    listData: any[];
    searchListData: any[];
    searchListView: DIDragListView;
    grayLayer: DIView;
    searchKey: string;
    currentLocation: DeskFile;
    currentHierarchy: any[];
    currentAnimation: number;
    currentAnimationFunc: any;
    currentAnimationInfo: DeskEventInfo;
    uploadingFiles: any[];
    allowDrag: boolean;
    alertView: DIAlertView;
    locationOwner: any;
    dragSelect: number;
    useLocation: any;
    categoryId: number;
    locationData: any;
    eventManager: DeskEventManager;

    constructor(workSpace: WorkSpace, appName: string, appSetting: JsonMap) {
        super(workSpace, appName, appSetting, "DrawerWindow", 0);
        // this.window.setChildView(new StudentListView(this, this, 'StudentListView'));
        this.window.setChildView(new DIView());
        this.listViewContainer = new DIView("DrawerViewContainer");

        this.minWidth = 360;
        this.window.width = this.minWidth;

        // parse setting
        if (appSetting.drawerType === "openPanel") {
            this.drawerType = 1;
        }

        // Init list view navigator
        this.listNavigator = new DIView("DIListNavigator");
        // Init back button
        this.listBackButton = new DIButton("Back", "DINavigatorBackButton");
        this.listBackButton.body.removeChild(this.listBackButton.buttonBody);
        this.listBackButton.buttonBody = document.createElement("img");
        this.listBackButton.buttonBody.className = "DINavigatorIcon";
        this.listBackButton.buttonBody.setAttribute("src", Desk.getInstance().getDeskUI.BackButton);
        this.listBackButton.body.appendChild(this.listBackButton.buttonBody);
        this.listBackButton.setButtonEvent(this.navigateBack);
        this.listNavigator.addChildView(this.listBackButton);
        // Init add button
        this.listAddButton = new DIButton("Add", "DINavigatorAddButton");
        this.listAddButton.body.removeChild(this.listAddButton.buttonBody);
        this.listAddButton.buttonBody = document.createElement("img");
        this.listAddButton.buttonBody.className = "DINavigatorIcon";
        this.listAddButton.buttonBody.setAttribute("src", Desk.getInstance().getDeskUI.AddButton);
        this.listAddButton.body.appendChild(this.listAddButton.buttonBody);
        this.listAddButton.input = document.createElement("input");
        this.listAddButton.setButtonEvent(() => {
            if (!this.loading) {
                if (this.searchListView.hidden && this.grayLayer.hidden && this.currentAnimation < 0) {
                    this.setAddDirView();
                }
            }
        });
        this.listNavigator.addChildView(this.listAddButton);
        // Init upload button
        this.uploadButton = new DIButton("Upload", "DrawerUploadButton");
        this.uploadButton.body.removeChild(this.uploadButton.buttonBody);
        this.uploadButton.buttonBody = document.createElement("img");
        this.uploadButton.buttonBody.className = "DINavigatorIcon";
        this.uploadButton.buttonBody.setAttribute("src", Desk.getInstance().getDeskUI.UploadButton);
        this.uploadButton.setButtonEvent(() => this.uploadButton.input.click());
        this.uploadButton.body.appendChild(this.uploadButton.buttonBody);
        this.uploadButton.input = document.createElement("input");
        this.uploadButton.input.setAttribute("type", "file");
        this.uploadButton.input.setAttribute("multiple", "");
        this.uploadButton.body.appendChild(this.uploadButton.input);
        this.uploadButton.input.style.display = "none";
        this.listNavigator.addChildView(this.uploadButton);
        this.uploadButton.eventManager.add(this.uploadButton.input, "change", (evt: { target: { files: any; value: string } }) => {
            const files = evt.target.files;
            this.uploadFiles(files, this.currentLocation, () => {
                // fileManager.uploadFiles(files, this.currentLocation.id, function(file, error) {
                evt.target.value = "";
            });
        });

        // Init search field (view)
        this.searchView = new DIView("DIListSearchView");
        this.searchField = new DITextField("", false, "DIListSearchField");
        this.searchView.addChildView(this.searchField);
        this.searchImage = new DIImageView(Desk.getInstance().getDeskUI.SearchIcon, "DIListSearchImage");
        this.searchView.addChildView(this.searchImage);
        this.searchView.eventManager.add(this.searchView.body, "click", () => {
            this.searchImage.hidden = true;
            this.searchField.editable = true;
            this.searchField.textBody.focus();
            this.activateSearch();

            this.searchField.eventManager.add(this.searchField.body, "keydown", (evt: { keyCode: number }) => {
                if (evt.keyCode === 27) {
                    this.searchField.stringValue = "";
                    this.searchField.textBody.blur();
                }
            });

            this.searchField.eventManager.add(this.searchField.body, "input", () => {
                if (!this.grayLayer.hidden) {
                    // searchField was empty
                    this.grayLayer.hidden = true;
                    this.searchFiles(this.searchField.stringValue, 0, () => {
                        this.listView.reloadData();
                    });
                } else {
                    this.searchFiles(this.searchField.stringValue, 0, () => {
                        this.listView.reloadData();
                    });
                }
            });
        });

        this.searchView.eventManager.add(this.searchField.body, "blur", () => {
            if (this.searchField.stringValue === "") {
                this.searchImage.hidden = false;
                this.searchField.editable = false;
                this.deactivateSearch();
            }
            this.searchField.clearEvents();
        });

        // this.searchView.events.push(new DeskEvent(this.searchField.body, "input", this.searchStudents.bind(this)));

        // Init list view
        this.listViewTitles = ["Subject", "Class", "Students"];
        this.listViewDepth = 0;
        this.listData = [];
        this.listView = new DIDragListView(this, this, "2", "ListView");
        this.listView.cellHeight = 40;
        this.listViewContainer.addChildView(this.listView);
        this.listView.body.style.width = "100%";
        this.listView.body.style.height = "100%";
        if (this.drawerType === 1) {
            this.listView.multipleSelection = false;
        }

        // Init search list view
        this.searchListData = [];
        this.searchListView = new DIDragListView(this, this, "1", "ListView");
        this.searchListView.cellHeight = 40;
        this.listViewContainer.addChildView(this.searchListView);
        this.searchListView.body.style.width = "100%";
        this.searchListView.body.style.height = "calc(100% - 66px)";
        this.searchListView.body.style.zIndex = "2";
        this.searchListView.hidden = true;

        // Init middle layer
        this.grayLayer = new DIView();
        this.grayLayer.body.style.backgroundColor = "#A7A7A7";
        this.grayLayer.body.style.opacity = "0.5"; // 0.5 to activate
        this.grayLayer.body.style.width = "100%";
        this.grayLayer.body.style.height = "calc(100% - 66px)";
        this.grayLayer.y = 66;
        this.grayLayer.hidden = true;

        this.searchKey = "";
        this.currentLocation = Secretary.getInstance().fileManager.homeFolder;
        this.currentHierarchy = [this.currentLocation];

        this.requestData(0, () => {
            this.listView.reloadData();
            this.loading = false;
        });

        this.window.child.addChildView(this.listNavigator);
        this.window.child.addChildView(this.searchView);
        this.searchView.y = 33;
        this.window.child.addChildView(this.listViewContainer);
        this.listViewContainer.y = 66;
        this.window.child.addChildView(this.grayLayer);

        this.currentAnimation = -1;
        this.currentAnimationInfo = null;

        this.uploadingFiles = [];
        // Init icon drag
        this.allowDrag = true;
        this.listViewContainer.eventManager.add(
            this.listViewContainer.body,
            "mousedown",
            (evt: { button: number; clientX: number; clientY: any; preventDefault: () => void; stopPropagation: () => void }) => {
                if (evt.button === 0) {
                    // drag works only with primary button
                    const left = this.listViewContainer.body.getBoundingClientRect().left;
                    if (evt.clientX - 10 > left && evt.clientX < left + 42) {
                        const index = this.listView.getIndex(evt.clientY);
                        if (index < this.listView.children.length && index >= 0) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            if (this.listView.selected.indexOf(index) !== -1) {
                                let i = 0;
                                const files = [];
                                const view = new DIView();
                                for (; i < this.listView.selected.length; i++) {
                                    const thisIndex = this.listView.selected[i];
                                    if (this.currentLocation.id === "0" && this.listData[thisIndex].type === "RCB") return;
                                    files.push(this.listData[thisIndex]);
                                    const icon = new DIImageView(this.listView.children[thisIndex].icon.imageSource);
                                    icon.imageBody.style.width = "32px";
                                    icon.body.style.height = "32px";
                                    icon.y = (thisIndex - index) * this.listView.cellHeight;
                                    icon.body.className = "DrawerFileMerge";
                                    view.addChildView(icon);
                                }
                                const clip = new DeskClipboard("application/Drawer", JSON.stringify(files));
                                Desk.getInstance().startDrag(
                                    clip,
                                    view,
                                    evt.clientX,
                                    evt.clientY,
                                    this.listView.children[index].icon.body.getBoundingClientRect().left,
                                    this.listView.children[index].icon.body.getBoundingClientRect().top
                                );
                            } else {
                                if (this.listData[index].type !== "RCB") {
                                    const clip = new DeskClipboard("application/Drawer", `${[this.listData[index]]}`);
                                    clip.addData("text/plain", this.listData[index].name);
                                    const view = new DIImageView(this.listView.children[index].icon.imageSource);
                                    view.imageBody.style.width = "32px";
                                    view.body.style.height = "32px";
                                    Desk.getInstance().startDrag(
                                        clip,
                                        view,
                                        evt.clientX,
                                        evt.clientY,
                                        this.listView.children[index].icon.body.getBoundingClientRect().left,
                                        this.listView.children[index].icon.body.getBoundingClientRect().top
                                    );
                                }
                            }
                        }
                    }
                }
            }
        );
        Desk.getInstance().setUpContextMenu(this.listViewContainer.eventManager, this.listViewContainer.body, this);
        this.loading = true;
        this.eventManager = new DeskEventManager();
    }

    wakeUp() {
        if (this.currentAnimation >= 0) {
            if (this.currentAnimation === 0) {
                this.currentAnimationFunc();
            } else if (this.currentAnimation === 1) {
                this.currentAnimationFunc();
            }
        }
        this.window.wakeUp();
    }

    putInSleep() {
        this.window.putInSleep();
    }

    resizeWidth(width: number) {
        const tmp = super.resizeWidth(width);
        if (!(tmp === false)) {
            let i = 0;
            width = (tmp as number) - 32;
            for (; i < this.listView.children.length; i++) {
                this.listView.children[i].width = width;
                if (this.listView.children[i].ending) this.listView.children[i].name.body.style.maxWidth = (width - 192).toString() + "px";
            }
        }
        return tmp;
    }

    setAddDirView() {
        // this better check if addDirView or RenamView is already in use
        this.loadingScreen.hidden = false; // barrow gray layer from loading screen, but not animation
        // Get new folder name
        let i = 0;
        let j = 1;
        for (; i < this.listData.length; i++) {
            if (this.listData[i].type === "DIR") {
                if (this.listData[i].name.substring(0, 10) === "New Folder") {
                    if (this.listData[i].name.length === 10) {
                        if (j === 1) j++;
                    } else if (this.listData[i].name.substring(10, 11) === " ") {
                        const num = this.listData[i].name.substring(11);
                        if (!isNaN(num)) {
                            if (j <= num) {
                                j = parseInt(num) + 1;
                            }
                        }
                    }
                }
            }
        }
        let folderName = "New Folder";
        if (j !== 1) {
            folderName = folderName.concat(" ", j.toString());
        }
        // prepare rename view (alertView)
        this.alertView = new DIAlertView("Enter a name for this folder.", "false", "DrawerRenameView");
        this.alertView.autoHeight = false;
        this.alertView.textField = new DITextField(folderName, true, "DrawerRenameField");
        this.alertView.eventManager.add(this.window.child.body, "keydown", (evt: { keyCode: number }) => {
            if (evt.keyCode === 13) {
                // enter key
                this.alertView.buttons[0].buttonBody.click();
            } else if (evt.keyCode === 27) {
                // esc
                this.alertView.buttons[1].buttonBody.click();
            }
        });

        this.alertView.addButton("Create", () => {
            this.addDirectory(this.alertView.textField.stringValue);
            this.alertView.textField = null;
            this.alertView.delete();
            this.alertView = null;
            // this.loadingScreen.hidden = true;
        });
        this.alertView.addChildView(this.alertView.textField);
        this.alertView.addButton("Cancel", () => {
            this.alertView.textField = null;
            this.alertView.delete();
            this.alertView = null;
            this.loadingScreen.hidden = true;
        });
        this.window.child.addChildView(this.alertView);
        (this.alertView.textField.body.firstChild as HTMLInputElement).select();
    }

    setRenameView(file: { name: any; ext: any }) {
        if (!this.loading) {
            this.loadingScreen.hidden = false; // barrow gray layer from loading screen, but not animation
            // prepare rename view (alertView)
            this.alertView = new DIAlertView("Enter a name for this file.", "false", "DrawerRenameView"); // the string need to be edited
            this.alertView.autoHeight = false;
            let originalName = file.name;
            if (file.ext) originalName = originalName.concat(".", file.ext);
            this.alertView.textField = new DITextField(originalName, true, "DrawerRenameField");
            this.alertView.eventManager.add(this.window.child.body, "keydown", (evt: { keyCode: number }) => {
                if (evt.keyCode === 13) {
                    // enter key
                    this.alertView.buttons[0].buttonBody.click();
                } else if (evt.keyCode === 27) {
                    // esc
                    this.alertView.buttons[1].buttonBody.click();
                }
            });
            this.alertView.addButton("Done", () => {
                const name = this.alertView.textField.stringValue;
                this.alertView.textField = null;
                this.alertView.delete();
                this.alertView = null;
                // this.loadingScreen.hidden = true;
                if (originalName !== name) {
                    // file name changed
                    this.renameFile(file, name);
                } else {
                    this.loadingScreen.hidden = true;
                }
            });
            this.alertView.addChildView(this.alertView.textField);
            this.alertView.addButton("Cancel", () => {
                this.alertView.textField = null;
                this.alertView.delete();
                this.alertView = null;
                this.loadingScreen.hidden = true;
            });
            this.window.child.addChildView(this.alertView);
            (this.alertView.textField.body.firstChild as HTMLInputElement).select();
        }
    }

    addDirectory(folderName: any) {
        this.loading = true;
        const currentLocation = this.currentLocation;
        const fileManager = new FileManager();
        fileManager.addFolder(this.currentLocation, folderName, (addedFolderId: any, error: { type: number; message: any; detail: any }) => {
            if (error) {
                if (error.type === 1) {
                    // server error
                    this.alertError(error.message, error.detail, () => {});
                    return;
                }
                if (error.type === 2) {
                    // folder name in use
                    this.loading = false;
                    this.alert(
                        error.message,
                        () => {
                            this.setAddDirView();
                        },
                        "className"
                    );
                    return;
                }
                if (error.type === 3) {
                    // invalid location
                    this.loading = false;
                    this.alert(
                        error.message,
                        () => {
                            this.setAddDirView();
                        },
                        "className"
                    );
                    return;
                }
                return;
            }
            this.requestData(0, () => {
                this.listView.reloadData();
                this.loading = false;
            });
            this.workSpace.dataUpdated("UpdateFolders", [currentLocation.id], this);
        });
    }

    renameFile(file: any, newName: any) {
        this.loading = true;
        const fileManager = new FileManager();
        fileManager.renameFile(file, newName, (error: { type: number; message: any; detail: any }) => {
            if (error) {
                this.loading = false;
                if (error.type === 1) {
                    // server error
                    this.alertError(error.message, error.detail, () => {});
                    return;
                }
                if (error.type === 2) {
                    // folder name in use
                    this.loading = false;
                    this.alert(
                        error.message,
                        () => {
                            this.setAddDirView();
                        },
                        "className"
                    );
                    return;
                }
                return;
            }
            this.requestData(0, () => {
                this.listView.reloadData();
                this.loading = false;
            });
            this.workSpace.dataUpdated("UpdateFolders", [this.currentLocation], this);
        });
    }

    deleteFiles(fileList: any[]) {
        this.loading = true;
        // let folders = [];
        const locations: string[] = []; // locations to check who need to be updated
        let lastLoc = null;
        let i = 0;
        for (; i < fileList.length; i++) {
            // preparing locations for update(reload) folders
            if (!(lastLoc === fileList[i].parent)) {
                let j = 0;
                for (; j < locations.length; j++) {
                    if (locations[i] === fileList[i].parent) break;
                }
                if (j === locations.length) {
                    locations.push(fileList[i].parent);
                    lastLoc = fileList[i].parent;
                }
            }
        }
        const fileManager = new FileManager();
        fileManager.trashFiles(fileList, (error: { type: number; message: any; detail: any }) => {
            if (error) {
                this.loading = false;
                if (error.type === 1) {
                    // server error
                    this.alertError(error.message, error.detail, () => {});
                    return;
                }
                return;
            }
            // add new folder into the list
            locations.push("1");
            // need to be changed
            let i = locations.length;
            for (; i > 0; i--) {
                if (locations[i - 1] === this.currentLocation.id) break;
            }
            if (i === 0) {
                this.loading = false;
            } else {
                this.requestData(0, () => {
                    this.listView.reloadData();
                    this.loading = false;
                });
            }
            this.workSpace.dataUpdated("UpdateFolders", locations, this);
        });
    }

    copyFiles(fileList: string | any[], listData: any[]) {
        const files = [];
        files.push("Copy");
        let i = 0;
        let str = "";
        for (; i < fileList.length; i++) {
            if (listData[fileList[i]].type === "RCB") {
                // If user is trying to copy the trash can, ignore the cmd
                return false;
            }
            files[i + 1] = listData[fileList[i]];
            str = str.concat(listData[fileList[i]].name, "\n");
        }
        const clip = new DeskClipboard("application/Drawer", JSON.stringify(files));
        clip.addData("text/plain", str);
        Secretary.getInstance().setClipboard(clip);
    }

    cutFiles(fileList: string | any[], listData: any[]) {
        const files = [];
        files.push("Cut");
        let i = 0;
        let str = "";
        for (; i < fileList.length; i++) {
            if (listData[fileList[i]].type === "RCB") {
                // If user is trying to copy the trash can, ignore the cmd
                return false;
            }
            files[i + 1] = listData[fileList[i]];
            str = str.concat(listData[fileList[i]].name, "\n");
        }
        const clip = new DeskClipboard("application/Drawer", JSON.stringify(files));
        clip.addData("text/plain", str);
        Secretary.getInstance().setClipboard(clip);
    }

    pasteFiles(location: any) {
        const fileList = JSON.parse(`${Secretary.getInstance().getClipboard("application/Drawer")}`);
        if (!fileList) {
            // no files in clipboard to copy
            return;
        }
        this.loading = true;
        const files = [];
        const locations: string[] = []; // locations to check who need to be updated
        let lastLoc = null;
        const cmd = fileList[0];
        let i = 1;
        for (; i < fileList.length; i++) {
            files.push(fileList[i].id);
            if (cmd === "Cut") {
                if (!(lastLoc === fileList[i].parent)) {
                    let j = 0;
                    for (; j < locations.length; j++) {
                        if (locations[i] === fileList[i].parent) break;
                    }
                    if (j === locations.length) {
                        locations.push(fileList[i].parent);
                        lastLoc = fileList[i].parent;
                    }
                }
            }
        }
        let req: { addData: (arg0: string, arg1: any[]) => void; addEventListener: (arg0: string, arg1: any) => void; send: () => void };
        if (cmd === "Cut") {
            req = new RequestServer("MoveFiles");
        } else if (cmd === "Copy") {
            req = new RequestServer("CopyFiles");
        }
        if (this.locationOwner !== undefined) {
            if (this.locationOwner === 0 && cmd === "Copy") {
                this.alert("Access denied!", null, null);
                return;
            }
            req.addData("Owner", this.locationOwner);
        }
        req.addData("FileList[]", files);
        req.addData("Location", location);
        req.addEventListener(
            "load",
            (
                response: { DataBlockStatus: number; CopyFiles: any; UpdateResult: number; ConflictFiles: string | any[]; MoveFiles: any },
                err: { detail: any }
            ) => {
                if (err) {
                    this.alertError("Failed to paste files with following error from server:", err.detail, () => {});
                    return -1;
                }
                if (response.DataBlockStatus === 0) {
                    if (cmd === "Copy") {
                        response = response.CopyFiles;
                        // add new folder into the list
                        if (response.UpdateResult === 1) {
                            // copy failed
                            this.listView.reloadData();
                            this.loading = false;
                        } else if (response.UpdateResult === 0) {
                            if (location === this.currentLocation.id) {
                                this.requestData(0, () => {
                                    this.listView.reloadData();
                                    this.loading = false;
                                });
                                let i = 0;
                                for (; i < response.ConflictFiles.length; i++) {
                                    // should this alert be in english - loosely translates to 'In this location ... the folder already exists. Do you want to replace it?'?
                                    // Also, alert inside for() -- could be lots of alerts
                                    // Also, doesn't look like any actions are programmed
                                    const alert = this.alert(
                                        "이 위치에 '".concat(response.ConflictFiles[i].name, "' 폴더가 이미 존재합니다. 대치하시겠습니까?"),
                                        () => {},
                                        "className"
                                    );
                                    alert.buttons[0].stringValue = "Cancel";
                                }
                            }
                            this.workSpace.dataUpdated("UpdateFolders", [location], this);
                        }
                    } else if (cmd === "Cut") {
                        response = response.MoveFiles;
                        // add new folder into the list
                        if (response.UpdateResult === 1) {
                            // copy failed
                            this.listView.reloadData();
                            this.loading = false;
                        } else if (response.UpdateResult === 0) {
                            if (location === this.currentLocation.id) {
                                this.requestData(0, () => {
                                    this.listView.reloadData();
                                    this.loading = false;
                                });
                            }
                            locations.push(location);
                            this.workSpace.dataUpdated("UpdateFolders", locations, this);
                        }
                    }
                }
            }
        );
        req.send();
    }

    moveFiles(location: any, fileList: string | any[]) {
        this.loading = true;
        const files = [];
        const locations: string[] = []; // locations to check who need to be updated
        let lastLoc = null;
        let i = 0;
        for (; i < fileList.length; i++) {
            files.push(fileList[i].id);
            if (!(lastLoc === fileList[i].parent)) {
                let j = 0;
                for (; j < locations.length; j++) {
                    if (locations[i] === fileList[i].parent) break;
                }
                if (j === locations.length) {
                    locations.push(fileList[i].parent);
                    lastLoc = fileList[i].parent;
                }
            }
        }
        const req: { addData: (arg0: string, arg1: any[]) => void; addEventListener: (arg0: string, arg1: any) => void; send: () => void } =
            new RequestServer("MoveFiles");
        req.addData("FileList[]", files);
        req.addData("Location", location);
        if (this.locationOwner !== undefined) req.addData("Owner", this.locationOwner);
        req.addEventListener(
            "load",
            (response: { DataBlockStatus: number; MoveFiles: any; UpdateResult: number; ConflictFiles: string | any[] }, err: { detail: any }) => {
                if (err) {
                    this.alertError("Failed to paste files with following error from server:", err.detail, () => {});
                    return -1;
                }
                if (response.DataBlockStatus === 0) {
                    response = response.MoveFiles;
                    // add new folder into the list
                    if (response.UpdateResult === 1) {
                        // copy failed
                        this.listView.reloadData();
                        this.loading = false;
                    } else if (response.UpdateResult === 0) {
                        if (location === this.currentLocation.id) {
                            this.requestData(0, () => {
                                this.listView.reloadData();
                                this.loading = false;
                            });
                        } else {
                            locations.push(location);
                            // need to be changed
                            let i = locations.length;
                            for (; i > 0; i--) {
                                if (locations[i - 1] === this.currentLocation.id) break;
                            }
                            if (i === 0) {
                                this.loading = false;
                            } else {
                                this.requestData(0, () => {
                                    this.listView.reloadData();
                                    this.loading = false;
                                });
                            }
                        }
                        this.workSpace.dataUpdated("UpdateFolders", locations, this);
                        let i = 0;
                        for (; i < response.ConflictFiles.length; i++) {
                            let alert: { buttons: { stringValue: string }[] };
                            if (response.ConflictFiles[i].type === "DIR") {
                                // More non-english
                                alert = this.alert(
                                    "이 위치에 '".concat(response.ConflictFiles[i].name, "' 폴더가 이미 존재합니다. 대치하시겠습니까?"),
                                    () => {},
                                    "className"
                                );
                                alert.buttons[0].stringValue = "Cancel";
                            } else {
                                alert = this.alert(
                                    "이 위치에 '".concat(response.ConflictFiles[i].name, "' 파일이 이미 존재합니다. 대치하시겠습니까?"),
                                    () => {},
                                    "className"
                                );
                                alert.buttons[0].stringValue = "Cancel";
                            }
                        }
                    }
                }
            }
        );
        req.send();
    }

    emptyTrash() {
        this.loading = true;
        const req: { addEventListener: (arg0: string, arg1: any) => void; send: () => void } = new RequestServer("EmptyTrash");
        req.addEventListener("load", (response: { DataBlockStatus: number; UpdateResult: any }, err: { detail: any }) => {
            if (err) {
                this.alertError("Failed to empty trash with following error from server:", err.detail, () => {}, "className");
                return -1;
            }
            if (response.DataBlockStatus === 0) {
                response = response.UpdateResult;
                // add new folder into the list
                if (this.currentLocation.id === "1") {
                    this.requestData(0, () => {
                        this.listView.reloadData();
                        this.loading = false;
                    });
                } else {
                    this.loading = false;
                }
                this.workSpace.dataUpdated("UpdateFolders", [1], this);
            }
        });
        req.send();
    }

    // ------------------------------------------------------------------------------------------------
    // MARK: File upload
    // ------------------------------------------------------------------------------------------------
    uploadFiles(files: any, location: any, callback: any) {
        Secretary.getInstance().fileManager.uploadFiles(
            files,
            this.currentLocation.id,
            (file, error: any) => {
                console.log(`upload completed for file ${file.name}`);
                const index = this.listData.indexOf(file);
                if (index !== -1) {
                    const cell = this.listView.children[index];
                    cell.progressPie.hidden = true;
                    cell.icon.hidden = false;
                    cell.name.stringValue = file.name.concat(".", file.ext);
                    cell.icon.imageSource = this.getIconOf(file);
                } else if (file.id === this.currentLocation.id) {
                    // can't find the file in the list
                    // add missing file in the list
                    this.listData.push(file);
                    const cell = new DrawerListViewCell();
                    cell.name.stringValue = file.name.concat(".", file.ext);
                    cell.icon.imageSource = this.getIconOf(file);
                    this.listView.addCell(cell);
                }
            },
            this.updateUploadFile.bind(this),
            null
        );
    }

    updateUploadFile(file: { name: any; location: any }, progress: number) {
        console.log(`updateUploadFile: file ${file.name} with progress ${progress}`);
        const index = this.listData.indexOf(file);
        if (index !== -1) {
            console.log(`index found: ${index}`);
            const cell = this.listView.children[index];
            cell.progressPie.percent = Math.round(progress * 100);
        } else if (file.location === this.currentLocation.id) {
            // can't find the file in the list
            // add missing file in the list
            this.listData.push(file);
            const cell = new DrawerUploadViewCell();
            cell.name.stringValue = file.name;
            cell.progressPie.percent = Math.round(progress * 100);
            this.listView.addCell(cell);
            console.log("index not found and adding cell: ", cell);
        }
    }

    downloadFiles(fileList: string | any[], listData: any[]) {
        let downloader = document.createElement("a");
        for (let i = 0; i < fileList.length; i++) {
            downloader.download = listData[fileList[i]].name.concat(".", listData[fileList[i]].ext);
            downloader.href = Secretary.getInstance().urlForFile(listData[fileList[i]]);
            downloader.click();
        }
        downloader = null;
    }

    activateSearch() {
        this.grayLayer.hidden = false;
    }

    deactivateSearch() {
        this.grayLayer.hidden = true;
        if (this.searchField.stringValue === "") {
            this.searchListView.hidden = true;
        }
    }

    searchFiles(key: any, folder: any, func: () => void) {
        const req = new RequestServer("SearchFiles");
        req.addData("Location", folder);
        req.addData("SearchKey", key);
        req.addEventListener("load", (response, err) => {
            if (err) {
                this.alertError("Failed to load list data with following error from server:", err.detail, () => {});
                return -1;
            }
            if (response.DataBlockStatus === 0) {
                this.listData = response.SearchFiles.FileList;
                this.locationData = response.SearchFiles.Location;
                // this.listTitle.stringValue = tmp.SearchFiles.Location.name;
            }
            if (func) func();
        });
        req.send();
    }

    static isDataInfo(value: any): value is DataInfo {
        return value.FileLocation !== undefined && value.FileLocation !== null;
    }

    dataUpdated(str: string, data: any, sender: this) {
        if (!(sender === this)) {
            if (str === "UpdateFolders") {
                let i = 0;
                for (; i < data.length; i++) {
                    if (data[i] === this.currentLocation.id) {
                        // need to check if search view is being used instead ... maybe not?
                        this.requestData(0, () => {
                            this.listView.reloadData();
                            this.loading = false;
                        });
                        break;
                    }
                }
            } else if (str === "FileUploaded") {
                if (!Drawer.isDataInfo(data)) return;
                if (data.FileLocation === this.currentLocation.id) {
                    // This need to check if the user is looking at search view or not
                    let index = -1;
                    let i = 0;
                    for (; i < this.listData.length; i++) {
                        if (data.FileId === this.listData[i].id && this.listData[i].type === "UPD") {
                            if (data.oldName === this.listData[i].name) {
                                index = i;
                                break;
                            }
                        }
                    }
                    if (index !== -1) {
                        this.listData[index].name = data.FileName;
                        this.listData[index].type = data.FileType;
                        this.listView.children[index].name.stringValue = data.oldName;
                        this.listView.children[index].icon.imageSource = this.getIconOf(this.listData[index]);
                        this.listView.children[index].icon.hidden = false;
                    }
                }
            }
        }
    }

    dragStart(clipboard: any) {
        this.dragSelect = -1;
    }

    dragOn(x: any, y: any) {
        const index = this.listView.getIndex(y);
        Desk.getInstance().currentDragApp = this;
        if (!(index === this.dragSelect)) {
            if (this.dragSelect >= 0) {
                if (this.listView.selected.indexOf(this.dragSelect) === -1) {
                    // deselect only happens to the cell that was not selected previously.
                    this.listView.children[this.dragSelect].deselect();
                }
                this.dragSelect = -1;
            }
            if (index < this.listView.children.length && index >= 0) {
                if (this.listData[index].type === "DIR" || this.listData[index].type === "RCB") {
                    this.dragSelect = index;
                    this.listView.children[index].select();
                }
            }
        }
    }

    dragLeft() {
        if (this.dragSelect >= 0) {
            this.listView.children[this.dragSelect].deselect();
            this.dragSelect = -1;
        }
    }

    dragEnd(onHere: any, clipboard: { getData: (arg0: string) => any }, x: any, y: any) {
        if (onHere) {
            const index = this.listView.getIndex(y);
            if (this.dragSelect >= 0) {
                this.listView.children[this.dragSelect].deselect();
                this.dragSelect = -1;
            }
            if (index < this.listView.children.length && index >= 0) {
                if (this.listData[index].type === "DIR") {
                    const data = clipboard.getData("application/Drawer");
                    let i = 0;
                    for (; i < data.length; i++) {
                        if (this.listData[index].id === data[i].id) break;
                    }
                    if (i === data.length) {
                        Desk.getInstance().dragEnded = true;
                        this.moveFiles(this.listData[index].id, data);
                    }
                    this.dragSelect = -1;
                } else if (this.listData[index].type === "RCB") {
                    const data = clipboard.getData("application/Drawer");
                    Desk.getInstance().dragEnded = true;
                    this.deleteFiles(data);
                    this.dragSelect = -1;
                }
            } else {
                // drag ended on empty space
                const data = clipboard.getData("application/Drawer");
                Desk.getInstance().dragEnded = true;
                if (this.currentLocation.id !== "1") {
                    this.moveFiles(this.currentLocation.id, data);
                } else {
                    this.deleteFiles(data);
                }
                this.dragSelect = -1;
            }
        }
    }

    activate: () => {};

    backButtonTriggered: () => {};

    deactivate: () => {};

    resizeEnd: () => {};

    windowMaximized: () => {};

    windowMinimized: () => {};

    resizeStart: () => {};

    // ListData Section
    requestData(category: number, func: () => void) {
        let req: { addData: (arg0: string, arg1: string) => void; addEventListener: (arg0: string, arg1: any) => void; send: () => void };
        if (category === 0) {
            const fileManager = new FileManager();
            if (this.currentLocation.type === "SHR") {
                fileManager.requestRemoteDrive(
                    this.currentLocation.owner,
                    (fileList: any, locationData: { name: any }, error: { errDetail: any; message: any; detail: any }) => {
                        if (error) {
                            // TODO: not just alert error to user, but handle it properly
                            if (error.errDetail) {
                                this.alertError(error.message, error.detail, () => {});
                            } else {
                                this.alertError("titleText", error.message, () => {});
                            }
                            return;
                        }
                        this.listData = fileList;
                        this.locationData = locationData;
                        this.window.titleField.stringValue = locationData.name;
                        if (func) func();
                    }
                );
            } else {
                fileManager.listInFolder(
                    this.currentLocation,
                    (fileList: any, locationData: { name: any }, error: { errDetail: any; message: any; detail: any }) => {
                        if (error) {
                            // TODO: not just alert error to user, but handle it properly
                            if (error.errDetail) {
                                this.alertError(error.message, error.detail, () => {});
                            } else {
                                this.alertError("titleText", error.message, () => {});
                            }
                            return;
                        }
                        this.listData = fileList;
                        this.locationData = locationData;
                        this.window.titleField.stringValue = locationData.name;
                        if (func) func();
                    }
                );
            }
        } else if (category === 1) {
            // search
            req = new RequestServer("FileList");
            req.addData("SearchKey", this.searchKey);
            if (this.useLocation) req.addData("Location", this.searchLocation);
            req.addEventListener("load", (response: { DataBlockStatus: number; FileList: { FileList: any[] } }, err: { detail: string }) => {
                if (err) {
                    this.alertError("Failed to load list data with following error from server:", err.detail, () => {});
                    return -1;
                }
                if (response.DataBlockStatus === 0) {
                    this.listData = response.FileList.FileList;
                }
                if (func) func();
            });
            req.send();
        }
    }

    // ListView Navigation
    navigateBack() {
        // button works only if user is not searching
        if (this.searchListView.hidden && this.grayLayer.hidden && this.listViewDepth > 0 && this.currentAnimation < 0) {
            this.currentLocation = this.currentHierarchy[this.listViewDepth - 1];
            this.currentHierarchy.pop();
            this.switchListView(-1);
        }
    }

    switchListView(index: number) {
        if (index >= 0) {
            // this.loading = true;
            let oldView = this.listView;
            this.listViewDepth += 1;
            this.categoryId = index + 1;
            oldView.putInSleep();
            this.requestData(0, () => {
                // this.loading = false; // the switching is too short to use loading if connection is not terrible
                this.listView.body.classList.add("CutOutAnimation");
                this.listView = new DIDragListView(this, this, "2", "ListView");
                this.listView.body.classList.add("SlideInAnimation");
                this.listView.cellHeight = 40;
                this.listView.body.style.width = "100%";
                this.listView.body.style.height = "100%";
                this.listView.reloadData();
                this.listView.putInSleep();
                if (this.drawerType === 1) {
                    this.listView.multipleSelection = false;
                }
                this.listViewContainer.addChildView(this.listView);
                this.currentAnimation = 0;
                this.currentAnimationFunc = () => {
                    if (this.currentAnimation === 0) {
                        this.listView.body.classList.remove("SlideInAnimation");
                        oldView.delete();
                        oldView = null;
                        this.eventManager.delete(this.currentAnimationInfo?.id);
                        this.currentAnimationInfo = null;
                        this.currentAnimation = -1;
                        this.listView.wakeUp();
                    }
                };
                this.currentAnimationInfo = this.eventManager.add(this.listView.body, "animationend", this.currentAnimationFunc);
            });
        } else {
            // Back Arrow
            if (this.listViewDepth > 0) {
                // this.loading = true;
                let oldView = this.listView;
                this.listViewDepth -= 1;
                oldView.putInSleep();
                this.requestData(0, () => {
                    // this.loading = false;
                    this.listView = new DIDragListView(this, this, "2", "ListView");
                    this.listView.body.classList.add("CutInAnimation");
                    this.listView.cellHeight = 40;
                    this.listView.body.style.height = "100%";
                    this.listView.reloadData();
                    this.listView.putInSleep();
                    if (this.drawerType === 1) {
                        this.listView.multipleSelection = false;
                    }
                    this.listViewContainer.addChildView(this.listView);
                    oldView.body.classList.add("SlideOutAnimation");
                    this.currentAnimation = 1;
                    this.currentAnimationFunc = () => {
                        if (this.currentAnimation === 1) {
                            this.listView.body.style.width = "100%";
                            this.listView.body.classList.remove("CutInAnimation");
                            oldView.delete();
                            oldView = null;
                            this.eventManager.delete(this.currentAnimationInfo?.id);
                            this.currentAnimationInfo = null;
                            this.currentAnimation = -1;
                            this.listView.wakeUp();
                        }
                    };
                    this.currentAnimationInfo = this.eventManager.add(oldView.body, "animationend", this.currentAnimationFunc);
                });
            }
        }
    }

    // ------------------------------------------------------------------------------------------------
    // MARK: ListViewDelegate
    // ------------------------------------------------------------------------------------------------
    numberOfRows(listView: any) {
        if (listView === this.listView) return this.listData.length;
        if (listView === this.searchListView) return this.searchListData.length;
    }

    cellAtRow(listView: any, row: number) {
        if (listView === this.listView) {
            const cell = new DrawerListViewCell();
            cell.width = this.window.width - 32;
            if (this.listData[row].type === "DIR") {
                if (this.listData[row].name.length > 20) {
                    cell.name.stringValue = this.listData[row].name.substr(0, this.listData[row].name.length - 12);
                    cell.name.body.style.maxWidth = (this.window.width - 224).toString() + "px";
                    cell.ending = new DILabel("false", "DrawerListStringEnd");
                    cell.addChildView(cell.ending);
                    cell.ending.stringValue = this.listData[row].name.substr(-12, 12);
                } else {
                    cell.name.stringValue = this.listData[row].name;
                }
                cell.icon.imageSource = "/System/Desk/Resources/Icon/folder.png";
            } else if (this.listData[row].type === "RCB") {
                cell.name.stringValue = this.listData[row].name;
                cell.icon.imageSource = "/System/Desk/Resources/Icon/trashcan.png";
            } else if (this.listData[row].type === "NWK") {
                cell.name.stringValue = this.listData[row].name;
                cell.icon.imageSource = "/System/Desk/Resources/Icon/server.png";
            } else if (this.listData[row].type === "UPD") {
                if (this.listData[row].ext) cell.name.stringValue = this.listData[row].name.concat(".", this.listData[row].ext);
                else cell.name.stringValue = this.listData[row].name;
                let i = 0;
                for (; i < this.uploadingFiles.length; i++) {
                    if (this.uploadingFiles[i].fileId === this.listData[row].id) {
                        cell.icon.hidden = true;
                        cell.body.removeChild(cell.name.body);
                        cell.addChildView(this.uploadingFiles[i]);
                        cell.body.append(cell.name.body);
                        return cell;
                    }
                }
                if (cell.name.stringValue.length > 20) {
                    cell.ending = new DILabel("false", "DrawerListStringEnd");
                    cell.addChildView(cell.ending);
                    cell.ending.stringValue = cell.name.stringValue.substr(-12, 12);
                    cell.name.stringValue = cell.name.stringValue.substr(0, cell.name.stringValue.length - 12);
                    cell.name.body.style.maxWidth = (this.window.width - 224).toString() + "px";
                }
                // no thing found
                cell.icon.imageSource = "/System/Desk/Resources/Icon/uploading.svg";
            } else {
                if (this.listData[row].ext) cell.name.stringValue = this.listData[row].name.concat(".", this.listData[row].ext);
                else cell.name.stringValue = this.listData[row].name;
                if (cell.name.stringValue.length > 20) {
                    cell.ending = new DILabel("false", "DrawerListStringEnd");
                    cell.addChildView(cell.ending);
                    cell.ending.stringValue = cell.name.stringValue.substr(-12, 12);
                    cell.name.stringValue = cell.name.stringValue.substr(0, cell.name.stringValue.length - 12);
                    cell.name.body.style.maxWidth = (this.window.width - 224).toString() + "px";
                }
                cell.icon.imageSource = this.getIconOf(this.listData[row]);
            }
            return cell;
        } else if (listView === this.searchListView) {
            const cell = new DIListViewCell();
            cell.name = new DILabel(this.searchListData[row].name);
            cell.addChildView(cell.name);
            return cell;
        }
        return false;
    }

    getIconOf(file: { ext: any }) {
        switch (file.ext) {
            case "mp4":
                return "/System/Desk/Resources/Icon/video.png";
            case "pdf":
                return "/System/Desk/Resources/Icon/pdf.png";
            case "doc":
                return "/System/Desk/Resources/Icon/doc.png";
            case "docx":
                return "/System/Desk/Resources/Icon/doc.png";
            case "hwp":
                return "/System/Desk/Resources/Icon/hwp.png";
            case "worksheets":
                return "/System/Desk/Resources/Icon/worksheets.png";
            default:
                return "/System/Desk/Resources/Icon/file.png";
        }
    }

    listDidSelectRowAtIndex(listView: any, index: number) {
        if (listView === this.listView) {
            if (index >= 0) {
                if (this.currentLocation.id === "1") {
                    // in trash can
                } else {
                    // else where
                    if (this.listData[index].type === "DIR") {
                        // folder
                        this.currentLocation = this.listData[index];
                        this.locationOwner = this.locationData.ownerId;
                        this.currentHierarchy.push(this.currentLocation);
                        // clear selected Files
                        if (this.data.selectedFiles) this.data.selectedFiles.length = 0;
                        this.switchListView(index);
                    } else if (this.listData[index].type === "RCB") {
                        // trash can
                        this.currentLocation = Secretary.getInstance().fileManager.trashcan;
                        this.locationOwner = this.locationData.ownerId;
                        this.currentHierarchy.push(this.currentLocation);
                        this.switchListView(index);
                        // clear selected Files
                        if (this.data.selectedFiles) this.data.selectedFiles.length = 0;
                    } else if (this.listData[index].type === "NWK") {
                        // network
                        this.currentLocation = Secretary.getInstance().fileManager.networkFolder;
                        this.locationOwner = this.locationData.ownerId;
                        this.currentHierarchy.push(this.currentLocation);
                        this.switchListView(index);
                        // clear selected Files
                        if (this.data.selectedFiles) this.data.selectedFiles.length = 0;
                    } else if (this.listData[index].type === "SHR") {
                        // shared folders or drives
                        if (this.listData[index].id === -1) {
                            // public folder
                            this.currentLocation = this.listData[index];
                            this.locationOwner = 0;
                            this.currentHierarchy.push(this.currentLocation);
                            this.switchListView(index);
                        }
                    } else {
                        // file
                        if (this.data.selectedFiles) this.data.selectedFiles.length = 0;
                        this.data.selectedFiles = [this.listData[index]];
                    }
                }
            }
        } else if (listView === this.searchListView) {
            if (index >= 0) {
                // If regular list view have selected student, deselect
                if (this.listView.selected) this.listView.selected.deselect();
                this.data.studentId = this.searchListData[index].id;
                this.data.studentName = this.searchListData[index].name;
                this.workSpace.dataUpdated("", null, this);
            }
        } else if (listView === Desk.getInstance().contextMenu) {
            if (index >= 0) {
                Desk.getInstance().clearContextMenu();
                if (Desk.getInstance().contextList[index] === "Delete") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        const files = [];
                        let i = 0;
                        for (; i < this.listView.selected.length; i++) {
                            files.push(this.listData[this.listView.selected[i]]);
                        }
                        this.deleteFiles(files);
                    }
                } else if (Desk.getInstance().contextList[index] === "Download") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        this.downloadFiles(this.listView.selected, this.listData);
                    }
                } else if (Desk.getInstance().contextList[index] === "Copy") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        this.copyFiles(this.listView.selected, this.listData);
                    }
                } else if (Desk.getInstance().contextList[index] === "Cut") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        this.cutFiles(this.listView.selected, this.listData);
                    }
                } else if (Desk.getInstance().contextList[index] === "Paste") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        this.pasteFiles(this.currentLocation);
                    }
                } else if (Desk.getInstance().contextList[index] === "Rename") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        const file = this.listData[this.listView.selected[0]];
                        this.setRenameView(file);
                    }
                } else if (Desk.getInstance().contextList[index] === "Empty Trash") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        this.emptyTrash();
                    }
                } else if (Desk.getInstance().contextList[index] === "Package Content") {
                    if (this.searchListView.hidden && this.grayLayer.hidden) {
                        const index = this.listView.selected[0] as number; // only one should been selected for this menu item
                        this.currentLocation = this.listData[index];
                        this.currentHierarchy.push(this.currentLocation);
                        // clear selected Files
                        if (this.data.selectedFiles) this.data.selectedFiles.length = 0;
                        this.switchListView(index);
                    }
                }
            }
        }
    }

    prepareContexMenu(body: HTMLElement, x: any, y: any) {
        if (body === this.listViewContainer.body) {
            const index = this.listView.getIndex(y);
            if (index < this.listView.children.length && index >= 0) {
                if (!this.listView.children[index].selected) {
                    this.listView.deselectAll();
                    this.listView.selected.push(index);
                    this.listView.highlightCellAtIndex(index);
                }
                if (this.listView.selected.length === 1) {
                    // only one object selected
                    if (this.listData[index].type === "DIR") {
                        // directory
                        return ["Cut", "Copy", "Paste", "Delete", "Rename"];
                    } else if (this.listData[index].type === "RCB") {
                        // trash can
                        return ["Empty Trash"];
                    } else if (this.listData[index].type === "NWK") {
                        // network
                        return [];
                    } else if (this.listData[index].type === "PKG") {
                        // Package
                        return ["Package Content", "Cut", "Copy", "Paste", "Delete", "Rename"];
                    } else {
                        // file
                        return ["Cut", "Copy", "Paste", "Delete", "Rename", "Download"];
                    }
                } else {
                    // multiple object selected
                    for (let i = 0; i < this.listView.selected.length; i++) {
                        if (this.listData[this.listView.selected[i]].type === "RCB") return false;
                        // contains trashcan
                        else if (this.listData[this.listView.selected[i]].type === "NWK") return false; // contains network
                    }

                    // contains directories
                    for (let i = 0; i < this.listView.selected.length; i++) {
                        if (this.listData[this.listView.selected[i]].type === "DIR") return ["Cut", "Copy", "Paste", "Delete"];
                    }

                    // files only
                    return ["Cut", "Copy", "Paste", "Delete", "Download"];
                }
            } else {
                // clicked empty space
                return ["Paste"];
            }
        }
    }

    listDidHighlightedCells(listView: any, selected: string | any[]) {
        let i = 0;
        if (this.data.selectedFiles) this.data.selectedFiles.length = 0;
        else this.data.selectedFiles = [];
        for (; i < selected.length; i++) {
            // need to check if search list is being used
            this.data.selectedFiles.push(this.listData[selected[i]]);
        }
    }

    delete() {
        // TODO: this need to be fixed
        // I have stopped working on it before finish this part

        // delte back button
        this.listBackButton = null;
        // delete add button
        this.listAddButton = null;
        // delete upload button
        this.uploadButton.input.remove();
        this.uploadButton.input = null;
        this.uploadButton = null;
        // delete search field (view)
        this.searchImage = null;
        this.searchField = null;
        this.searchView = null;
        // delete list view navigator
        this.listNavigator = null;
        this.listBackButton = null;
        // delete list view
        this.listView = null;
        // delete data
        this.listData = null;
        this.locationData = null;
        super.delete();
    }
}
