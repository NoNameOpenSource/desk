import { DeskEvent } from "../Secretary/DeskEvent";
import { Desk } from "./Desk";
import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
import { DIView } from "./DIView";

export class DIMiniWindowView extends DIView {
    titleBar: DIView;
    titleSize: any;
    titleField: any;
    closeButton: any;
    title: string;
    titleBarOptions: number;
    resize: boolean;
    delegate: any;
    desk: Desk;

    constructor(className: string, idName: string, title: string, x: number, y: number, width: number, height: number, titleBarOptions = 0) {
        if (!className) className = "DIMiniWindowView";
        super(className, idName);

        this.desk = Desk.getInstance();

        if (titleBarOptions < 5) {
            this.titleBar = new DIView("DIWindowTitleBar");
            this.titleBar.height = this.titleSize;
            // @ts-ignore TODO: type body better?
            this.body.addChildView(titleBar.titleBar);
            this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
            // Add title to titleBar
            if (titleBarOptions < 3) {
                this.titleField = new DILabel(title, "DIWindowTitle");
                this.titleBar.addChildView(this.titleField);
                if (titleBarOptions < 2) {
                    this.closeButton = new DIImageView(this.desk.getDeskUI["CloseButton"], "DIWindowButton");
                    this.closeButton.events.push(new DeskEvent(this.closeButton.imageBody, "click", this.close.bind(this)));
                    this.titleBar.addChildView(this.closeButton);
                    if (titleBarOptions < 1) {
                        // option for minimize and maximize
                        // this will be ignored for now
                    }
                }
            }
        }
        if (title) this.title = title;
        if (x) this.x = x;
        if (y) this.y = y;
        if (width) this.width = width;
        if (height) this.height = height;
        if (titleBarOptions) this.titleBarOptions = titleBarOptions;
    }

    mouseDown(evt: any) {
        //if(evt.button == 0) { // If primary button
        // Convert coord.
        var x = evt.clientX - this.x;
        var y = evt.clientY - this.y - 28;
        this.desk.bringWindowFront(this);
        if (this.resize && (x < 5 || x > this.width - 5)) {
            // Resizing window in X
        } else if (y < 20) {
            // TitleBar got clicked
            evt.preventDefault(); // Disable text selection
            //!-----------
            //Desk.beginWindowDrag(this, evt.clientX, evt.clientY);
            return false; // Disable text selection
        }
        //}
    }

    close() {
        if (this.delegate) this.delegate.windowWillClose(this);
        if (!this.deleted) this.delete();
    }

    delete() {
        super.delete();
        if (this.delegate) this.delegate.windowDidClose(this);
        this.delegate = null;
    }
}
