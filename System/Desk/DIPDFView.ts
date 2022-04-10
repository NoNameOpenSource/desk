import { DIView } from "./DIView";

export class DIPDFView extends DIView {
    pdfBody: HTMLElement;
    private _src: any;

    constructor(url: string, className?: string, idName?: string) {
        if (!className) className = "DIImageView";
        super(className, idName);
        this.canHaveChild = false;
        this.pdfBody = document.createElement("EMBED");
        this.pdfBody.setAttribute("alt", "pdf");
        this.pdfBody.setAttribute("pluginspage", "http://www.adobe.com/products/acrobat/readstep2.html");
        if (url) this.imageSource = url;
        this.body.appendChild(this.pdfBody);
    }

    get imageSource() {
        return this._src;
    }

    set imageSource(value) {
        this._src = value;
        this.pdfBody.setAttribute("src", value);
    }
}
