import { DIView } from "./DIView";

/**
 * Provides a simple way to display an image
 */
export class DIImageView extends DIView {
    /** Body of the view as HTML element  */
    body: HTMLElement;
    canHaveChild: boolean;
    imageBody: HTMLElement;
    _src: string;

    /**
     * @todo accept only string for className and pass undefined instead of false when necessary
     */
    constructor(image?: string, className?: string, idName?: string) {
        if (!className) className = "DIImageView";
        super(className, idName);
        this.canHaveChild = false;
        this.imageBody = document.createElement("IMG");
        if (image) this.imageSource = image;
        this.body.appendChild(this.imageBody);
    }

    get imageSource() {
        return this._src;
    }

    set imageSource(value) {
        this._src = value;
        this.imageBody.setAttribute("src", value);
    }
}
