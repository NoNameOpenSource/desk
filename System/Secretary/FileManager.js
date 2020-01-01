class FileManager {
	constructor() {
	}

	get homeFolder() {
		var homeFolder = new DeskFile(0, "My Cloud", "DIR", Secretary.currentUser.id);
		homeFolder.path = "~";
		return homeFolder;
	}

	get trashcan() {
		var trash = new DeskFile(1, "휴지통", "RCB", Secretary.currentUser.id);
		trash.path = "~/.Trash";
		return trash;
	}

	get networkFolder() {
		var network = new DeskFile(2, "네트워크", "NWK");
		network.path = "/Networks";
		return network;
	}

	isHomeFolder(folder) {
		if(folder.id != null) {
			if(folder.id == 0)
				return true;
			else
				return false;
		}
		var components = folder.split("/");
		if(components.length == 3) {
			if(components[1] == "Users") {
				return true;
			}
		}
		if(components.length == 4) {
			if(components[1] == "Users" && components[3] == "") {
				return true;
			}
		}
		return false;
	}

	/*
	** Request server to get contents of file
	** 
	** parameters
	** 	-fileIds		: id of the file
	**	-onCompletion	: callback function (Blob data, error)
	**
	*/
	loadFileDataWithId(fileId, onCompletion) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', Secretary.urlForFileId(fileId));
		xhr.responseType = "blob";
		xhr.addEventListener('load', function(evt) {
			if(evt.target.status == 200) {
				// .OK
				onCompletion(evt.target.response, null);
			} else if(evt.target.status == 404) {
				// .notFound
				var err = Object.freeze({ message : "Failed to find file"});
				onCompletion(null, err);
			} else if(evt.target.status == 400) {
				// .badRequest
				var err = Object.freeze({ message : "Server responsed with bad request"});
				onCompletion(null, err);
			} else if(evt.traget.status == 500) {
				// .internalServerError
				var err = Object.freeze({ message : "Server responsed with internal server error"});
				onCompletion(null, err);
			} else if(evt.target.status == 401) {
				// .unauthorized
				var err = Object.freeze({ message : "Server responsed with unauthorized request"});
				onCompletion(null, err);
			} else {
				// .unknown error
				var err = Object.freeze({ message : "Unknown error occured"});
				onCompletion(null, err);
			}
		});
		xhr.send();
	}

	/*
	** Request server to get contents of the file in the folder
	** 
	** parameters
	** 	-folderId		: id of folder to find file
	** 	-fileName		: name of the file to find in the folder
	**	-onCompletion	: callback function (file as text?, error)
	** 
	** errorType
	** 	1 : server error
	**	2 : file does not exist
	**	3 : invalid location
	**
	*/
	loadFileInFolder(folderId, fileName, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('FileInFolder');
		req.addData('Folder', folderId);
		req.addData('File', fileName)
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json
			try {
				json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to load file with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus == 0) {
				if(json.FileInFolder.status == 0) {
					// file found
					Secretary.loadFileWithId(json.FileInFolder.file.id, onCompletion);
				} else if(json.FileInFolder.status == 1) {
					// 404 not found!
					var err = Object.freeze({ type : 2,
										   message : "File does not exist" });
				}
			}
		});
		req.send();
	}

	/*
	** Request server to get list in folder
	** 
	** parameters
	**	-folder			: DeskFile folder to list files
	**	-onCompletion	: callback function (fileList, locationData, error)
	** 
	** errorType
	** 	1 : server error
	**
	*/
	listInFolder(folder, onCompletion) {
		if(!onCompletion)
			return;
		if(folder.owner != Secretary.currentUser.id && this.isHomeFolder(folder)) {
			this.requestRemoteDrive(folder.owner, onCompletion);
			return;
		}
		var req = new RequestServer('FileList');
		if(folder.id != null && folder.id != -1) {
			req.addData('Location', folder.id);
		} else {
			req.addData('Path', folder.path);
		}
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to load list data with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to load list data with data with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'FileList'" });
				onCompletion(null, null, err);
				return;
			}
			if(!json.FileList.Location) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to load list data with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, null, err);
				return;
			}
			json = json.FileList;
			var files = new Array();
			if(folder.id == 0) {
				// home folder
				// add networks and trash
				files.push(this.trashcan);
				files.push(this.networkFolder);
			}
			var path = folder.path
			if(path[path.length - 1] == "/") {
				path = path.slice(0, path.length - 1);
			}
			for (var i = 0; i < json.FileList.length; i++) {
				var file = DeskFile.initWithFile(json.FileList[i]);
				file.path = path + "/" + file.name;
				files.push(file);
			}
			var location = DeskFile.initWithFile(json.Location);
			if(location.path == null)
				location.path = folder.path;
			onCompletion(files, location, null);
		}.bind(this));
		req.send();
	}

	/*
	** get DeskFile by Path
	** 
	** parameters
	**	-path			: path of the file
	**	-onCompletion	: callback function (DeskFile file, error)
	** 
	** errorType
	**	1 : server error
	**	2 : unauthorized
	**	3 : file does not exist
	**
	*/
	getFileByPath(path, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('FileByPath');
		req.addData('Path', path);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to get file with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to get file with data with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'FileByPath'" });
				onCompletion(null, err);
				return;
			}
			json = json.FileByPath;
			if(json.Error) {
				var errorCode = json.Error
				if(errorCode == 1) { // file does not exist
					var err = Object.freeze({ type : 3,
										   message : "File does not exist"});
					onCompletion(null, err);
					return;
				}
				if(errorCode == 2) { // database error
					var err = Object.freeze({ type : 1,
										   message : "Failed to add new folder with database error from server"});
					onCompletion(null, err);
					return;
				}
				if(errorCode == 3) { // permission is not given to view list
					var err = Object.freeze({ type : 2,
										   message : "Unauthorized request"});
					onCompletion(null, err);
					return;
				}
			}
			var file = DeskFile.initWithFile(json.File);
			file.path = path;
			onCompletion(file, null);
		}.bind(this));
		req.send();
	}

	/*
	** Request server to make new folder in a folder
	** 
	** parameters
	**	-folder			: DeskFile folder where the new folder will be created
	**	-folderName		: name of the folder to create
	**	-onCompletion	: callback function (addedFolderId, error)
	** 
	** errorType
	** 	1 : server error
	**	2 : folder name in use
	**	3 : invalid location
	**
	*/
	addFolder(folder, folderName, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('AddDirectory');
		if(folder.id == 2) {
			var err = Object.freeze({ type : 3,
								   message : "Can not create folder in this location" });
			onCompletion(null, err);
			return;
		}
		req.addData('Name', folderName);
		req.addData('Location', folder.id);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'AddDirectory'" });
				onCompletion(null, err);
				return;
			}
			json = json.AddDirectory;
			if(json.UpdateResult == 1) { // already same name exist
				var err = Object.freeze({ type : 2,
									   message : "'" + folderName + "'이름이 이미 사용중 입니다."});
				onCompletion(null, err);
				return;
			}
			if(json.UpdateResult == 2) { // database error
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with database error from server"});
				onCompletion(null, err);
				return;
			}
			onCompletion(json.FolderId, null);
		}.bind(this));
		req.send();
	}

	/*
	** Request server to get list in remote location
	** 
	** parameters
	**	-userId			: id of the owner of the drive to access
	**	-onCompletion	: callback function (fileList, locationData, error)
	** 
	** errorType
	** 	1 : server error
	**	2 : unauthorized
	**	3 : invalid location
	**
	*/
	requestRemoteDrive(userId, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('RemoteDrive');
		req.addData('UserId', userId);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to load list data with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to load list data with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'RemoteDrive'" });
				onCompletion(null, null, err);
				return;
			}
			json = json.RemoteDrive;
			if(json.UpdateResult == 1) { // remote location does not exist
				var err = Object.freeze({ type : 2,
									   message : "Unauthorized request"});
				onCompletion(null, null, err);
				return;
			}
			if(json.UpdateResult == 2) { // database error
				var err = Object.freeze({ type : 1,
									   message : "Failed to load list data with database error from server"});
				onCompletion(null, null, err);
				return;
			}
			if(json.UpdateResult == 3) { // permission is not given to view list
				var err = Object.freeze({ type : 2,
									   message : "Unauthorized request"});
				onCompletion(null, null, err);
				return;
			}
			var location = DeskFile.initWithFile(json.Location);
			location.path = this.networkFolder.path + "/" + location.name;
			var files = new Array();
			for (var i = 0; i < json.FileList.length; i++) {
				var file = DeskFile.initWithFile(json.FileList[i]);
				file.path = location.path + "/" + file.name;
				files.push(file);
			}
			onCompletion(files, location, null);
		}.bind(this));
		req.send();
	}

	/*
	** Upload files to the server
	** 
	** parameters
	** 	-files			: HTML file objects (Array)
	**	-onCompletion	: callback function (file, error) // call back function will be called for each file
	**	-onProgress		: callback function (file, loaded, total) // call back function will be called when progress updates for each file
	** 
	** errorType
	** 	1 : server error
	**	2 : unauthorized
	**	3 : invalid location
	**
	*/
	uploadFiles(htmlFileObjects, location, onCompletion, onProgress) {
		if(!onCompletion)
			return;
		var names = new Array();
		for(var i = 0; i < htmlFileObjects.length; i++) {
			if(htmlFileObjects[i].size >= 4294967296) { // 4GB files
				// can't upload file bigger than 4GB
			} else {
				names.push(htmlFileObjects[i].name);
			}
		}
		// request server to get place to upload the files
		var req = new RequestServer('FileUploadRequest');
		req.addData('Location', location);
		req.addData('Names[]', names);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'FileUploadRequest'" });
				onCompletion(null, err);
				return;
			}
			json = json.FileUploadRequest;
			var errors = new Array();
			for(var i = 0; i < json.fileIds.length; i++) {
				if(json.fileIds[i] < 0) { // name already exist
					var err = Object.freeze({ type : 2,
										   message : "'" + names[i] + "'이름이 이미 사용중 입니다. 업로드에 실패하였습니다."});
					onCompletion(null, err);
				} else {
					var file = new DeskFileUpload(json.fileIds[i], names[i]);
					file.location = location;
					file.size = htmlFileObjects[i].size;
					if(file.size < 1000000000) // file approximately less than 1GB
						Secretary.uploadFile(htmlFileObjects[i], file, onCompletion, onProgress);
					else
						Secretary.uploadBigFile(htmlFileObjects[i], file, onCompletion, onProgress);
				}
			}
		}.bind(this));
		r0eq.send();
	}

	/*
	** Rename given file
	** 
	** parameters
	** 	-file			: DeskFile Object
	**	-name			: new name for the file
	**	-onCompletion	: callback function (error)
	** 
	** errorType
	** 	1 : server error
	**	2 : file name in use
	**
	*/
	renameFile(file, name, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('RenameFile');
		req.addData('Name', name);
		req.addData('File', file.id);
		req.addData('Type', file.type);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : evt.target.responseText });
				onCompletion(err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'RenameFile'" });
				onCompletion(err);
				return;
			}
			json = json.RenameFile;
			if(json.UpdateResult == 1) { // already same name exist
				var err = Object.freeze({ type : 2,
									   message : "'" + folderName + "'이름이 이미 사용중 입니다."});
				onCompletion(err);
				return;
			}
			onCompletion(null);
		}.bind(this));
		req.send();
	}

	/*
	** Make blank file
	** 
	** parameters
	**	-name			: name for the file
	**	-folder			: folder to make blank file
	**	-onCompletion	: callback function (addedDeskFile, error)
	** 
	** errorType
	**	1 : server error
	**	2 : file name in use
	**
	*/
	touch(name, folder, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('AddBlankFile');
		req.addData('Name', name);
		req.addData('Location', folder.id);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to add new folder with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'AddBlankFile'" });
				onCompletion(null, err);
				return;
			}
			json = json.AddBlankFile;
			if(json.UpdateResult == 1) { // already same name exist
				var err = Object.freeze({ type : 2,
									   message : "'" + name + "'이름이 이미 사용중 입니다."});
				onCompletion(null, err);
				return;
			}
			var file = new DeskFile(json.FileId, name, 'BIN');
			onCompletion(file ,null);
		}.bind(this));
		req.send();
	}


	/*
	** Copy files
	** 
	** parameters
	**	-files			: array of DeskFile objects to copy
	**	-folder			: folder to paste the copy
	**	-onCompletion	: callback function (conflictedFiles, error)
	** 
	** errorType
	**	1 : server error
	**	2 : invalid location
	**
	*/
	copyFiles(files, folder, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('CopyFiles');
		var fileIds = new Array();
		for (var i = 0; i < files.length; i++) {
			fileIds.push(files[i].id);
		}
		req.addData('FileList[]', fileIds);
		req.addData('Location', folder.id);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to copy files with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to copy files with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'CopyFiles'" });
				onCompletion(null, err);
				return;
			}
			json = json.CopyFiles;
			if(json.UpdateResult == 1) { // already same name exist
				var err = Object.freeze({ type : 2,
									   message : "Can not copy files into this location"});
				onCompletion(null, err);
				return;
			}
			if(json.UpdateResult == 2) { // database error
				var err = Object.freeze({ type : 1,
									   message : "Failed to copy files with database error from server"});
				onCompletion(null, err);
				return;
			}
			// check conflicted files
			var conflictedFiles = new Array();
			for (var i = 0; i < json.ConflictFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if(files[j].name == json.ConflictFiles[i].name) {
						conflictedFiles.push(files[j]);
						break;
					}
				}
			}
			onCompletion(conflictedFiles, null);
		}.bind(this));
		req.send();
	}



	/*
	** Move files
	** 
	** parameters
	**	-files			: array of DeskFile objects to move
	**	-folder			: folder to paste the move
	**	-onCompletion	: callback function (conflictedFiles, error)
	** 
	** errorType
	**	1 : server error
	**	2 : invalid location
	**
	*/
	moveFiles(files, folder, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('MoveFiles');
		var fileIds = new Array();
		for (var i = 0; i < files.length; i++) {
			fileIds.push(files[i].id);
		}
		req.addData('FileList[]', fileIds);
		req.addData('Location', folder.id);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to move files with following error from server",
										detail : evt.target.responseText });
				onCompletion(null, err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to move files with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'MoveFiles'" });
				onCompletion(null, err);
				return;
			}
			json = json.MoveFiles;
			if(json.UpdateResult == 1) { // already same name exist
				var err = Object.freeze({ type : 2,
									   message : "Can not move the files into this location"});
				onCompletion(null, err);
				return;
			}
			if(json.UpdateResult == 2) { // database error
				var err = Object.freeze({ type : 1,
									   message : "Failed to move files with database error from server"});
				onCompletion(null, err);
				return;
			}
			// check conflicted files
			var conflictedFiles = new Array();
			for (var i = 0; i < json.ConflictFiles.length; i++) {
				for (var j = 0; j < files.length; j++) {
					if(files[j].name == json.ConflictFiles[i].name) {
						conflictedFiles.push(files[j]);
						break;
					}
				}
			}
			onCompletion(conflictedFiles, null);
		}.bind(this));
		req.send();
	}

	/*
	** Trash files
	** 
	** parameters
	**	-files			: array of DeskFile objects to throw into trash can
	**	-onCompletion	: callback function (error)
	** 
	** errorType
	**	1 : server error
	**
	*/
	trashFiles(files, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('TrashFiles');
		var fileIds = new Array();
		for (var i = 0; i < files.length; i++) {
			fileIds.push(files[i].id);
		}
		req.addData('FileList[]', fileIds);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to trash files with following error from server",
										detail : evt.target.responseText });
				onCompletion(err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to trash files with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'TrashFiles'" });
				onCompletion(err);
				return;
			}
			// json = json.TrashFiles;
			onCompletion(null);
		}.bind(this));
		req.send();
	}


	/*
	** Delete files
	** 
	** parameters
	**	-files			: array of DeskFile objects to delete
	**	-onCompletion	: callback function (error)
	** 
	** errorType
	**	1 : server error
	**
	*/
	deleteFiles(files, onCompletion) {
		if(!onCompletion)
			return;
		var req = new RequestServer('DeleteFiles');
		var fileIds = new Array();
		for (var i = 0; i < files.length; i++) {
			fileIds.push(files[i].id);
		}
		req.addData('FileList[]', fileIds);
		req.addEventListener('load', function(evt) {
			// Analysis received data
			var json;
			try {
					json = JSON.parse(evt.target.responseText);
			}
			catch(err) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to delete files with following error from server",
										detail : evt.target.responseText });
				onCompletion(err);
				return;
			}
			if(json.DataBlockStatus != 0) {
				var err = Object.freeze({ type : 1,
									   message : "Failed to delete files with following error from server",
										detail : "Server returned DataBlockStatus = " + json.DataBlockStatus + " with datablock 'DeleteFiles'" });
				onCompletion(err);
				return;
			}
			json = json.DeleteFiles;
			if(json.UpdateResult == 2) { // database error
				var err = Object.freeze({ type : 1,
									   message : "Failed to delete files with database error from server"});
				onCompletion(err);
				return;
			}
			onCompletion(null);
		}.bind(this));
		req.send();
	}
}