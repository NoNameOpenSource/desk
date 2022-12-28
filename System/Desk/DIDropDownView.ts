import { DeskEventInfo } from "../Secretary";
import { DIListView } from "./DIListView";

export class DIDropDownView extends DIListView {
    moveEventInfo: DeskEventInfo;
    upEventInfo: DeskEventInfo;

    constructor(dataSource: any, delegate: any, cellClickType: any, className?: string, idName?: string) {
        if (!className) className = "DIListView";
        super(false, delegate, 3, className, idName);
        if (dataSource) {
            this.dataSource = dataSource;
        }
        this.eventManager.add(this.body, "mousedown", this.mouseDown);
        this.moveEventInfo = null;
    }

    mouseDown(evt: MouseEvent) {
        evt.preventDefault();
        this.highlightCell(Math.floor((evt.clientY - this.body.getBoundingClientRect().top) / this.cellHeight));
        document.documentElement.style.cursor = "default";
        // @ts-ignore TODO: not sure how to fix this
        document.documentElement.style["-webkit-user-select"] = "none";
        this.moveEventInfo = this.eventManager.add(document, "mousemove", this.mouseMove);
        this.upEventInfo = this.eventManager.add(document, "mouseup", this.mouseUp);
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
        this.eventManager.delete(this.moveEventInfo.id);
        document.documentElement.style.cursor = "";
        // @ts-ignore TODO: not sure how to fix this
        document.documentElement.style["-webkit-user-select"] = "";
        this.eventManager.delete(this.upEventInfo.id);
        // @ts-ignore TODO: bug TODO: maybe this.didSelectRowAtIndex()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        didSelectRowAtIndex();
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
