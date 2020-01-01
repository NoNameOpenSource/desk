/*
** 생성자
**
** -dataBaseType	: 데이터베이스로 사용될 프로그램의 종류
**		-MySQL	: 1
*/
var Secretary = new function () {
	this.applications = new Array();
	this.windows = new Array();
	this.serverProtocol = "";
	this.serverName = "";
	this.version = "";
	this.getVariables = new Object();
	this.serverType = "";
	this.dataManagerURL = "";
	this.workSpaces = new Array();
	this.mainWorkSpace = null;
	this.plugins = new Object();
	this.pluginFrames = new Array();
	this.uploads = new Array();
	this.currentUser;
	this.users = new Array();
	this.browser = "unknown browser";
	this.browserVersion = "0";
	this.ESVersion;
	this.appList = new Array();
	
	this.init = function() {
		// Init based on the server
		if(this.serverType == "php") {
			this.dataManagerURL = "/System/DataManager/DataManager.php";
		} else {
			this.dataManagerURL = "/System/DataManager";
		}

		// Detect Browser
		if(navigator.userAgent.indexOf("Chrome") != -1) {
			this.browser = "Chrome";
		} else if(navigator.userAgent.indexOf("Safari") != -1) {
			this.browser = "Safari";
		} else if(navigator.userAgent.indexOf("Firefox") != -1) {
			if(navigator.userAgent.indexOf("Seamonkey") == -1)
				this.browser = "Firefox";
		} else if(navigator.userAgent.indexOf("Opera") != -1) {
			this.browser = "Opera";
		}

		if(this.browser != "unknown borwser") {
			var index = navigator.userAgent.indexOf(this.browser);
			var versionStr = navigator.userAgent.slice(index + this.browser.length + 1);
			index = versionStr.indexOf(" ");
			if(index == -1) {
				index = versionStr.length;
			}
			versionStr = versionStr.slice(0, index);
			this.browserVersion = versionStr;
		}

		// Detect ECMAScript Version
		this.ESVersion = this.checkESVersion();

		// Load WorkSpaces
		req = new RequestServer('WorkSpaces');
		req.addEventListener('load', function(response, err) {
			if(err) {
				// the system errors should be handled with a new way
				Secretary.alertError("Failed to load WorkSpaces with following error from server:", evt.detail);
				return -1;
			}
			if(response.DataBlockStatus == 0) {
				var i = 0;
				for(;i<response.WorkSpaces.length;i++) {
					var tmpWS = new WorkSpace(response.WorkSpaces[i].name, "/System/Secretary/AppIcon/".concat(response.WorkSpaces[i].icon,".png"), response.WorkSpaces[i].apps, response.WorkSpaces[i].settings);
					Secretary.workSpaces.push(tmpWS);
				}
			}
			
			// Set first work space as main space
			Secretary.setMainWorkSpace(Secretary.workSpaces[0]);
		});
		req.send();
		
		// load plugins
		this.loadPlugins();

		// load side menu app list
		this.appList;
		req = new RequestServer('ProgramList');
		req.addEventListener('load', function(response, err) {
			if(err) {
				// the system errors should be handled with a new way
				Secretary.alertError("Failed to load ProgramList with following error from server:", evt.detail);
				return -1;
			}
			if(response.DataBlockStatus == 0) {
				Secretary.appList = response.ProgramList;
			}
			
			// reload desk menu
			Desk.deskMenu.reloadData();
		});
		req.send();
	}
	
	this.setMainWorkSpace = function(workSpace) {
		if(Secretary.mainWorkSpace) {
			Secretary.mainWorkSpace.putInSleep();
		}
		workSpace.wakeUp();
		Secretary.mainWorkSpace = workSpace;
		Desk.body.unplugChildViews();
		Desk.body.addChildView(Secretary.mainWorkSpace.body);
		// Update dock
		Desk.workSpaceDock.update();
	}
	
	this.quitWorkSpace = function(index) {
		var name = this.workSpaces[index].name;
		var icon = this.workSpaces[index].icon.imageSource;
		var appList = this.workSpaces[index].appList;
		this.workSpaces[index].delete();
		this.workSpaces[index] = new WorkSpace(name, icon, appList);
	}
	
	this.loadApp = function(appName, appSetting, workSpace) {
		if(appName == 'StudentList') {
			return new StudentList(workSpace, appName, appSetting);
		} else if(appName == 'Students') {
			return new Students(workSpace, appName, appSetting);
		} else if(appName == 'StudentInfo') {
			return new StudentInfo(workSpace, appName, appSetting);
		} else if(appName == 'ClassList') {
			return new ClassList(workSpace, appName, appSetting);
		} else if(appName == 'LectureList') {
			return new LectureList(workSpace, appName, appSetting);
		} else if(appName == 'LectureResList') {
			return new LectureResList(workSpace, appName, appSetting);
		} else if(appName == 'StudentInbox') {
			return new StudentInbox(workSpace, appName, appSetting);
		} else if(appName == 'StudentTicket') {
			return new StudentTicket(workSpace, appName, appSetting);
		} else if(appName == 'Drawer') {
			return new Drawer(workSpace, appName, appSetting);
		} else if(appName == 'Preview') {
			return new Preview(workSpace, appName, appSetting);
		} else if(appName == 'Problems') {
			return new Problems(workSpace, appName, appSetting);
		} else if(appName == 'WorkSheets') {
			return new WorkSheets(workSpace, appName, appSetting);
		} else if(appName == 'Terminal') {
			return new Terminal(workSpace, appName, appSetting);
		} else if(appName == 'TextEditor') {
			return new TextEditor(workSpace, appName, appSetting);
		} else if(appName == 'DocReader') {
			return new DocReader(workSpace, appName, appSetting);
		} else if(appName == 'Debugger') {
			return new Debugger(workSpace, appName, appSetting);
		}
	}
	
	this.loadScripts = function(appName) {
		
	}
	
	this.setClipboard = function(clipboard) {
		if(this.clipboard) {
			this.clipboard.delete();
			this.clipboard = null;
		}
		this.clipboard = clipboard;
	}
	
	this.getClipboard = function(dataType) {
		if(this.clipboard) {
			return this.clipboard.getData(dataType);
		} else
			return false;
	}
	
	this.loadPlugins = function() {
		// MathJax
		var idx = this.pluginFrames.push(document.createElement("IFRAME")) - 1;
		var mathJaxFrame = this.pluginFrames[idx];
		mathJaxFrame.setAttribute("src", "/System/Plugins/MathJax.html");
		mathJaxFrame.onload = function() {
			this.plugins.MathJax = mathJaxFrame.contentWindow.MathJax;
			this.plugins.MathJax.buffer = mathJaxFrame.contentWindow.document.getElementById("buffer");
		}.bind(this);
		Desk.addPluginFrame(mathJaxFrame);
		mathJaxFrame.style.display = ""; // MathJax does not work with 'display: none'
		mathJaxFrame.style.position = "absolute";
		mathJaxFrame.style.left = "100%";
		mathJaxFrame.style.top = "100%";
		// Tesseract.js
		idx = this.pluginFrames.push(document.createElement("IFRAME")) - 1;
		var tesseractFrame = this.pluginFrames[idx];
		tesseractFrame.setAttribute("src", "/System/Plugins/Tesseract.js.html");
		tesseractFrame.onload = function() {
			this.plugins.Tesseract = tesseractFrame.contentWindow.Tesseract;
		}.bind(this);
		Desk.addPluginFrame(tesseractFrame);
		// pdf.js
		idx = this.pluginFrames.push(document.createElement("IFRAME")) - 1;
		var pdfFrame = this.pluginFrames[idx];
		pdfFrame.setAttribute("src", "/System/Plugins/pdf.js.html");
		pdfFrame.onload = function() {
			this.plugins.PDFJS = pdfFrame.contentWindow.pdfjsLib;
		}.bind(this);
		Desk.addPluginFrame(pdfFrame);
	}

	this.checkESVersion = function() {
		try {
			const objects = { Gibson: "Les Paul", Fender: "Stratocaster"}
			if(Object.values(objects)[0] == "Les Paul")
				return 8;
		} catch (e) {
		}

		try {
			var x = 0;
			x = 3 ** 4;
			if(x == 81)
				return 7;
		} catch(e) {
		}

		// the minimum supported version of this program is 6
		// so assume the current version is at least 6
		return 6;
	}

	this.alertError = function(titleText, errorMsg, func) {
		Desk.alertError(titleText, errorMsg, func)
	}

	this.urlForFile = function(file) {
		if(file.id) {
			return this.urlForFileId(file.id);
		}
		var components = file.path.split('/');
		if(components[0] == "~") {
			// user directory
		} else {
			if(components[1] == "Networks") {
				// user directory
			} else {
				// system (root) directory
				return file.path;
			}
		}
	}

	this.urlForFileId = function(fileId) {
		if(Secretary.serverType == "php") {
			return "/system/DataManager/DownloadBIN.php?file=".concat(fileId)
		} else {
			return "/System/DownloadBIN?file=".concat(fileId)
		}
	}

	this.urlForStream = function(fileId) {
		if(Secretary.serverType == "php") {
			return "/system/DataManager/Stream.php?file=".concat(fileId)
		} else {
			return "/System/Stream?file=".concat(fileId)
		}
	}

	this.loadFileWithId = function(fileId, onCompletion, sync) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', Secretary.urlForFile(fileId), !sync);
		xhr.addEventListener('load', function(evt) {
			if(evt.target.status == 200) {
				// .OK
				onCompletion(evt.target.response);
			} else if(evt.target.status == 404) {
				// .notFound
			} else if(evt.target.status == 400) {
				// .badRequest
			} else if(evt.traget.status == 500) {
				// .internalServerError
			} else if(evt.target.status == 401) {
				// .unauthorized
			} else {
				// .unknown error
			}
		});
		xhr.send();
	}

	this.loadFileInFolder = function(folderId, fileName, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('FileInFolder');
		req.addData('Folder', folderId);
		req.addData('File', fileName);
		req.addEventListener('load', function(response, responseErr) {
			if(responseErr) {
				let err = Object.freeze({"titleText" : "Failed to load file with following error from server:",
												"errMsg" : responseErr.detail });
				onCompletion(null, err);
				return -1;
			}
			if(response.DataBlockStatus == 0) {
				if(response.FileInFolder.status == 0) {
					// file found
					Secretary.loadFileWithId(response.FileInFolder.file.id, onCompletion);
				} else if(response.FileInFolder.status == 1) {
					// 404 not found!
					let err = Object.freeze({"titleText" : "File does not exist"});
				}
			}
		});
		req.send();
	}

	this.loadFileWithPath = function(path, onCompletion) {
	}

	this.openDrawer = function(option) {
		option.drawerType = "openPanel"
		var drawer = Secretary.loadApp('Drawer', option, null)
	}

	this.receivedMessageFromServer = function(message) {
	}

	this.fileManager = new FileManager();

	/*
	** Upload file to the server
	** 
	** parameters
	** 	-htmlFileObject	: HTML file object
	** 	-file			: DeskFileUpload object
	**	-onCompletion	: callback function (file, error)
	**	-onProgress		: callback function (file, loaded, total)
	** 
	** errorType
	** 	1 : server error
	**
	*/
	this.uploadFile = function(htmlFileObject, file, onCompletion, onProgress) {
		var req = new RequestServer('FileUpload', true);
		req.addData('File', htmlFileObject);
		req.addData('FileId', file.id);
		this.uploads.push(file);
		req.addEventListener('load', function(response, responseErr) {
			file.didFinishUpload();
			var index = this.uploads.indexOf(file);
			this.uploads.splice(index, 1);
			// Analysis received data
			if(responseErr) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : responseErr.detail });
				onCompletion(file, err);
				return;
			}
			if(response.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : "Server returned DataBlockStatus = " + response.DataBlockStatus + " with datablock 'FileUpload'" });
				onCompletion(file, err);
				return;
			}
			response = response.FileUpload;
			if(response.UpdateResult != 0) { // file did not uploaded with an error
				var err = Object.freeze({ type : response.UpdateResult + 2,
									   message : "Failed to upload file '" + fileName + "' (Error Code: " + (response.UpdateResult + 2) + ")"});
				onCompletion(file, err);
				return;
			}
			let name = file.name.match(/.+\./)[0];
			if(!name) { name = file.name; }
			else {
				let ext = file.name.match(/\.[^\.]+$/)[0];
				file.ext = ext.slice(1);
				file.name = name.slice(0, name.length - 1);
			}
			onCompletion(file, null);
		}.bind(this));
		req.ajax.upload.addEventListener('progress', function(evt) { // Progress handler
			console.log(`progress event called with ${evt.loaded} / ${evt.total}`);
			file.progress = evt.loaded / evt.total;
			if(onProgress) {
				onProgress(file, file.progress);
			}
		});
		req.send();
	}
	/*
	** Get user info by user id
	** 
	** parameters
	** 	-userId			: id of the user to get info
	**	-onCompletion	: callback function (User, error)
	** 
	** errorType
	** 	1 : server error
	**
	*/
	this.getUserInfo = function(userId, onCompletion) {
	}
}