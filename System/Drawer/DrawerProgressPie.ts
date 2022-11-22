import { DIView } from "../Desk";

export class DrawerProgressPie extends DIView {
    buttons: any[];
    svg: SVGSVGElement;
    pie: SVGCircleElement;
    _percent: number;
    constructor() {
        const className = "DrawerUploadProgress";
        super(className, "false");
        this.buttons = [];
        // Add pie svg
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttributeNS(null, "width", "32px");
        this.svg.setAttributeNS(null, "height", "32px");
        this.pie = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.pie.setAttributeNS(null, "r", "8");
        this.pie.setAttributeNS(null, "cx", "16");
        this.pie.setAttributeNS(null, "cy", "16");
        this.svg.appendChild(this.pie);
        this.body.appendChild(this.svg);
        this.canHaveChild = false;
        this._percent = 0;
    }

    get percent() {
        return this._percent;
    }

    set percent(value) {
        if (value < 0) {
            this._percent = 0;
        } else if (value > 100) {
            this._percent = 100;
        } else {
            this._percent = value;
        }
        // should 158 be 158px?
        this.pie.style.strokeDasharray = `${(this._percent * 50) / 100} 158`;
    }

    delete() {
        super.delete();
    }
}
