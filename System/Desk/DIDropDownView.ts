import { DeskEvent } from "../Secretary/DeskEvent";
import { DIListView } from "./DIListView";

export class DIDropDownView extends DIListView {
    mouseEvent: number;

    constructor(dataSource: any, delegate: any, cellClickType: any, className?: string, idName?: string) {
        if (!className) className = "DIListView";
        super(false, delegate, 3, className, idName);
        if (dataSource) {
            this.dataSource = dataSource;
        }
        this.events.push(new DeskEvent(this.body, "mousedown", this.mouseDown.bind(this)));
        this.moveEvent = null;
    }

    mouseDown(evt: MouseEvent) {
        evt.preventDefault();
        this.highlightCell(Math.floor((evt.clientY - this.body.getBoundingClientRect().top) / this.cellHeight));
        this.moveEvent = this.events.length;
        document.documentElement.style.cursor = "default";
        // @ts-ignore TODO: not sure how to fix this
        document.documentElement.style["-webkit-user-select"] = "none";
        this.events.push(new DeskEvent(document, "mousemove", this.mouseMove.bind(this)));
        this.events.push(new DeskEvent(document, "mouseup", this.mouseUp.bind(this)));
    }

    mouseMove(evt: any) {
        const body = this.body.getBoundingClientRect();
        if (evt.clientX > body.left && evt.clientX < body.right) {
            // If y is higher than top, top becomes y. If y is lower than bottom, bottom becomes y.
            const y = (evt.clientY < body.top ? evt.clientY : body.top) > body.bottom ? evt.clientY : body.bottom;
            this.highlightCell(Math.floor((y - body.top) / this.cellHeight));
        }
    }

    mouseUp() {
        this.events[this.moveEvent].delete();

        document.documentElement.style.cursor = "";
        document.documentElement.style.userSelect = "";

        this.events[this.moveEvent + 1].delete();
        this.events.splice(this.mouseEvent, 2);

        this.didSelectRowAtIndex(this.selectedIndex);
    }

    highlightCell(index: number) {
        // @ts-ignore TODO: bug
        if (selected === this.children[index]) return false;
        if (this.selected) {
            this.selected.deselect();
        }
        this.selected = this.children[index];
        // @ts-ignore TODO: maybe just selected instead of selected()
        this.selected.selected();
        this.selectedIndex = index;
    }
}
