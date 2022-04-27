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
    evtFunc: (this: Element, ev: any) => any;

    stopped: boolean;

    constructor(target: Element | Document | Window, method: string, evtFunc: (this: Element, ev: any) => any, init = true) {
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
