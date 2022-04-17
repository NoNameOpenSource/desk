import { DIView } from "./DIView";

export class DIProgressView extends DIView {
    progressBody: HTMLElement;
    _total: number;
    _completed: number;
    _progress: number;

    constructor(className?: string, idName?: string) {
        if (!className) className = "DIProgressView";
        super(className, idName);
        this.canHaveChild = false;
        this.progressBody = document.createElement("DIV");
        this.body.appendChild(this.progressBody);
    }

    updateProgress() {
        if (this._total && this._completed) {
            if (this._total === 0) {
                this.progress = 100;
                return;
            }
            this.progress = this._completed / this.total;
        }
    }

    get progress() {
        return this._progress;
    }

    set progress(value) {
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        this.progressBody.style.width = "".concat(`${value}`, "%");
        this._progress = value;
    }

    get completed() {
        return this._completed;
    }

    set completed(value) {
        this._completed = value;
        this.updateProgress;
    }

    get total() {
        return this._total;
    }

    set total(value) {
        this._total = value;
        this.updateProgress;
    }
}
