import { DeskFile } from "./DeskFile";

export class DeskFileUpload extends DeskFile {
    location: string;
    private _progress: number;
    size: number;
    listeners: (() => void)[];

    constructor(id: string, name: string) {
        super(id, name, "UPD", null);
        this._progress = 0.0;
        this.size = 0;
        this.listeners = [];
    }

    listen(callback: () => void) {
        this.listeners.push(callback);
    }

    didFinishUpload() {
        this.progress = 1.0;
        this.listeners = [];
    }

    // @ts-ignore
    set progress(newValue: number) {
        this._progress = newValue;
        // TODO: of instead of in?
        for (const callback of this.listeners) {
            // @ts-ignore
            callback(this, this.progress);
        }
    }

    // @ts-ignore
    get progress() {
        return this._progress;
    }
}
