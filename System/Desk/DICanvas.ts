import { DIView } from "./DIView";

type DICanvasContextId = "2d" | "bitmaprenderer" | "webgl" | "webgl2" | string;

export class DICanvas extends DIView {
    canvas: HTMLCanvasElement;
    ctx: any;

    constructor(className?: string, idName?: string, contextId?: DICanvasContextId) {
        if (!className) {
            className = "DICanvas";
        }

        super(className, idName);

        this.canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        this.body.appendChild(this.canvas);

        if (contextId) {
            this.ctx = this.canvas.getContext(contextId);
        } else {
            this.ctx = this.canvas.getContext("2d");
        }
    }

    delete() {
        this.ctx = null;
        this.canvas.remove();
        super.delete();
    }
}
