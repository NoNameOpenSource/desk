/**
 * Object that handles css animations
 */
 export class DeskAnimation {
    target: any;
    animation: any;
    type: any;
    stopped: boolean;
    func: any;

    constructor(target, animation, type, func) {
        this.target = target;
        this.animation = animation;
        this.type = type;
        this.stopped = false;

        // init animation
        this.target.classList.add(animation);
        if (type == 0) {
            this.func = function () {
                this.delete();
            }.bind(this);
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
