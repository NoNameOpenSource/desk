export interface DeskEventListener {
    (this: Element, ev: any): any;
}

/**
 * Represents and handles an event
 */
export class DeskEvent {
    /**
     * target element
     */
    target: Element | Document | Window;

    /**
     * name of the event
     */
    method: string;

    /**
     * the function that needs to be called
     */
    listener: DeskEventListener;

    stopped: boolean;

    constructor(target: Element | Document | Window, method: string, listener: DeskEventListener, init = true) {
        this.target = target;
        this.method = method;
        this.listener = listener;
        if (init) target.addEventListener(method, listener, true);
        this.stopped = false;
    }

    stop() {
        if (!this.stopped) {
            this.target.removeEventListener(this.method, this.listener, true);
            this.stopped = true;
        }
    }

    resume() {
        if (this.stopped) {
            this.target.addEventListener(this.method, this.listener, true);
            this.stopped = false;
        }
    }

    delete() {
        this.stop();
        this.target = null;
        this.method = null;
        this.listener = null;
    }
}
