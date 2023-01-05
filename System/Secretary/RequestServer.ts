import { secretaryInstance } from "./Singleton";

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
    // eslint-disable-next-line @typescript-eslint/ban-types
    formData: Object;
    dataBlock: any;
    ajax: XMLHttpRequest;
    url: string;
    listeners: ((response: Record<string, any>, error: any) => void)[];

    /**
     * @todo type dataBlock
     */
    constructor(dataBlock: any, useMultipart?: boolean) {
        this.url = secretaryInstance.dataManagerURL;
        this.ajax = new XMLHttpRequest();
        this.listeners = [];
        if (useMultipart || secretaryInstance.serverType === "php") this.useMultipart = true;
        else this.useMultipart = false;
        if (this.useMultipart) this.formData = new FormData();
        else this.formData = new Object();
        this.dataBlock = dataBlock;
        this.addData("dataBlock", dataBlock);
    }

    addData(name: string, value: any) {
        if (this.useMultipart)
            // @ts-ignore TODO: maybe type formData as FormData and initialize it as FormData
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.formData.append(name, value);
        // @ts-ignore TODO: bug
        else this.formData[name] = value;
    }

    addEventListener(name: string, func: (response: Record<string, any>, error: any) => void) {
        if (name === "load" && func) {
            this.listeners.push(func);
        }
    }

    responseFromServer(evt: Event) {
        // @ts-ignore
        const statusCode: number = evt.target.status;
        if (statusCode === 200) {
            // .OK
            let json;
            try {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                json = JSON.parse(evt.target.responseText);
            } catch {
                // @ts-ignore
                const err = Object.freeze({ type: 0, message: "Failed parse json", detail: evt.target.responseText });
                this.callListeners(null, err);
            }
            this.callListeners(json, null);
        } else if (statusCode === 404) {
            // .notFound
            const err = Object.freeze({ message: "Failed to find file" });
            this.callListeners(null, err);
        } else if (statusCode === 400) {
            // .badRequest
            const err = Object.freeze({ message: "Server responsed with bad request" });
            this.callListeners(null, err);
            // @ts-ignore TODO: bug - "traget"
        } else if (statusCode === 500) {
            // .internalServerError
            const err = Object.freeze({ message: "Server responsed with internal server error" });
            this.callListeners(null, err);
        } else if (statusCode === 401) {
            // .unauthorized
            const err = Object.freeze({ message: "Server responsed with unauthorized request" });
            this.callListeners(null, err);
        } else {
            // .unknown error
            const err = Object.freeze({ message: "Unknown error occured" });
            this.callListeners(null, err);
        }
    }

    callListeners(response: any, _err: any) {
        for (const listener of this.listeners) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
