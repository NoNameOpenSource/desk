import { DIView } from "./DIView";

/**
 * This is a simple way to display an image
 */
export class DICanvasView extends DIView {
    canvasBody: HTMLCanvasElement;
    imageBody: HTMLElement;

    /**
     * @todo maybe create this.imageBody from `image` parameter?
     * @todo use or remove image
     */
    constructor(image: any, className?: string, idName?: string) {
        if (!className) {
            className = "DICanvasView";
        }
        super(className, idName);
        this.canHaveChild = false;
        this.canvasBody = document.createElement("canvas");
        this.body.appendChild(this.imageBody);
    }

    didMoveToDesk() {
        super.didMoveToDesk();
        this.canvasBody.style.width = "".concat(`${this._width}`, "px");
        this.canvasBody.style.height = "".concat(`${this._height}`, "px");
    }
}
