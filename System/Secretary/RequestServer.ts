import { Secretary } from "./Secretary";

/**
 * This class is dedicated to seding ajax request with formData.
 * It's just wrapping XMLHttpRequest bit easier way.
 *
 * -url        : Similar to Widnows` PID, it determinates which app this is from other apps, running.
 * -ajax        : Name of the Application
 * -formData		: Type of the Application
 *     -null		: -1
 *     -GUIapp	: 1
 *     -Widget	: 2
 *     -noGUI		: 3
 *
 * -appBody		:Body of the Application. This is Highest HTML Elements of GUI of this app.
 */
export class RequestServer {
    useMultipart: boolean;
    formData: Object;
    dataBlock: any;
    ajax: XMLHttpRequest;
    url: string;
    listeners: any[];
    secretary: Secretary;

    /**
     * @todo type dataBlock
     * @todo use or remove sync parameter
     */
    constructor(dataBlock: any, useMultipart?: boolean, sync?: boolean) {
        this.secretary = Secretary.getInstance();

        this.url = this.secretary.dataManagerURL;
        this.ajax = new XMLHttpRequest();
        this.listeners = [];
        if (useMultipart || this.secretary.serverType == "php") this.useMultipart = true;
        else this.useMultipart = false;
        if (this.useMultipart) this.formData = new FormData();
        else this.formData = new Object();
        this.dataBlock = dataBlock;
        this.addData("dataBlock", dataBlock);
    }

    addData(name: string, value: any) {
        if (this.useMultipart)
            // @ts-ignore TODO: maybe type formData as FormData and initialize it as FormData
            this.formData.append(name, value);
        // @ts-ignore TODO: bug
        else this.formData[name] = value;
    }

    addEventListener(name: string, func: (response: Record<string, any>, error: any) => void) {
        if (name == "load" && func) {
            this.listeners.push(func);
        }
    }

    responseFromServer(evt: any) {
        if (evt.target.status == 200) {
            // .OK
            var json;
            try {
                json = JSON.parse(evt.target.responseText);
            } catch {
                var err = Object.freeze({ type: 0, message: "Failed parse json", detail: evt.target.responseText });
                this.callListeners(null, err);
            }
            this.callListeners(json, null);
        } else if (evt.target.status == 404) {
            // .notFound
            let err = Object.freeze({ message: "Failed to find file" });
            this.callListeners(null, err);
        } else if (evt.target.status == 400) {
            // .badRequest
            let err = Object.freeze({ message: "Server responsed with bad request" });
            this.callListeners(null, err);
            // @ts-ignore TODO: bug - "traget"
        } else if (evt.traget.status == 500) {
            // .internalServerError
            let err = Object.freeze({ message: "Server responsed with internal server error" });
            this.callListeners(null, err);
        } else if (evt.target.status == 401) {
            // .unauthorized
            let err = Object.freeze({ message: "Server responsed with unauthorized request" });
            this.callListeners(null, err);
        } else {
            // .unknown error
            let err = Object.freeze({ message: "Unknown error occured" });
            this.callListeners(null, err);
        }
    }

    /**
     * @todo remove unused err parameter or use it
     */
    callListeners(response: any, err: any) {
        for (let listener of this.listeners) {
            listener(response);
        }
    }

    send(sync = false) {
        this.ajax.open("POST", this.url, !sync);
        this.ajax.addEventListener("load", this.responseFromServer.bind(this));
        if (this.useMultipart) {
            // @ts-ignore TODO: maybe type formData as FormData and initialize it as FormData
            this.ajax.send(this.formData);
        } else {
            this.ajax.setRequestHeader("Content-Type", "application/json");
            this.ajax.send(JSON.stringify(this.formData));
        }
    }
}
