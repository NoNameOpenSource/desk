/**
 * Object that handles css animations
 *
 *
 */
class DeskAnimation {
    /** target element */
    target: any;
    animation: any;
    type: any;
    stopped: boolean;
    /** the function that need to be called */
    func: any;

    constructor(target: any, animation: any, type: any, func: () => void) {
        this.target = target;
        this.animation = animation;
        this.type = type;
        this.stopped = false;

        // init animation
        this.target.classList.add(animation);
        if (type == 0) {
            this.func = () => {
                this.delete();
            };
            this.target.addEventListener("animationend", this.func);
        }
    }

    delete() {
        if (this.type == 0) {
            this.target.removeEventListener("animationend", this.func);
        }
        this.target = null;
        this.animation = null;
        this.func = null;
    }
}
