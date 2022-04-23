/**
 * Object that handles css animations
 */
export class DeskAnimation {
    /** target element */
    target: Element;
    animation: string;
    type: any;
    stopped: boolean;
    /** the function that need to be called */
    func: () => void;

    constructor(target: Element, animation: string, type: any, func: () => void) {
        this.target = target;
        this.animation = animation;
        this.type = type;
        this.stopped = false;
        this.func = func;

        // init animation
        this.target.classList.add(animation);
        if (type === 0) {
            this.func = () => {
                this.delete();
            };
            this.target.addEventListener("animationend", this.func);
        }
    }

    delete() {
        if (this.type === 0) {
            this.target.removeEventListener("animationend", this.func);
        }
        this.target = null;
        this.animation = null;
        this.func = null;
    }
}
