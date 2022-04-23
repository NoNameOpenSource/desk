import { DIView } from "./DIView";

export class DICanvas extends DIView {
    canvas: HTMLCanvasElement;
    ctx: any;

    constructor(className?: string, idName?: string, context?: any) {
        if (!className) className = "DICanvas";
        super(className, idName);
        this.canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        this.body.appendChild(this.canvas);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (context) this.ctx = this.canvas.getContext(context);
        else this.ctx = this.canvas.getContext("2d");
    }

    delete() {
        this.ctx = null;
        this.canvas.remove();
        super.delete();
    }
}
