import { DIView } from "./DIView";

/**
 * This class is controller for the 'View' class
 */
export class DIViewController {
    app: any;
    private _view: DIView;
    /** Array of child views of this view */
    private _child: DIViewController;

    constructor(view: any) {
        this.app;
        this._view;
        this._child;

        if (view) this.view = view;
    }

    putInSleep() {
        this.view.putInSleep();
    }

    wakeUp() {
        this.view.wakeUp();
    }

    get child() {
        return this._child;
    }

    set child(vc) {
        this._child = vc;
        if (vc !== null) {
            this._child.app = this.app;
            //this._child.parent = this;
        }
    }

    get view() {
        return this._view;
    }

    set view(view) {
        this._view = view;
        if (view !== null) {
            this.view._controller = this;
            // @ts-ignore
            view.parent = this;
        }
    }

    delete() {
        if (this.view) {
            this.view.delete();
        }
    }
}
