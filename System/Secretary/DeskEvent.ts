/**
 * Represents and handles an event
 */
export class DeskEvent {
    /**
     * target element
     */
    target;

    /**
     * name of the event
     */
    method;

    /**
     * the function that needs to be called
     */
    evtFunc;

    stopped: boolean;

    constructor(target: any, method: any, evtFunc: any, init = true) {
        this.target = target;
        this.method = method;
        this.evtFunc = evtFunc;
        if (init) target.addEventListener(method, evtFunc, true);
        this.stopped = false;
    }

    stop() {
        if (!this.stopped) {
            this.target.removeEventListener(this.method, this.evtFunc, true);
            this.stopped = true;
        }
    }

    resume() {
        if (this.stopped) {
            this.target.addEventListener(this.method, this.evtFunc, true);
            this.stopped = false;
        }
    }

    delete() {
        this.stop();
        this.target = null;
        this.method = null;
        this.evtFunc = null;
    }
}
