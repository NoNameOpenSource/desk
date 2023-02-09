import { DeskEventInfo } from "../Secretary";
import { DeskMenu } from "./DeskMenu";
import { DIListViewCell } from "./DIListViewCell";
import { DIListViewDataSource } from "./DIListViewDataSource";
import { DIView } from "./DIView";

/**
 * A view that displays lists
 *
 * @property cell			: Array of the cells
 * @property dataSource		: Object that will provide data to make list
 */
export class DIListView extends DIView {
    dataSource: DIListViewDataSource;
    delegate: DeskMenu;
    cellClickType: number;
    eventInfo: DeskEventInfo;
    cellHeight: number;
    selectedIndex: number;
    reloadTicket: number;
    moveEventInfo: DeskEventInfo;
    upEventInfo: DeskEventInfo;
    selected: DIListViewCell;
    children: DIListViewCell[];

    // TODO: create an enum for cellClickType
    // TODO: type dataSource and delegate
    constructor(dataSource: any, delegate: any, cellClickType: number, className: string, idName?: string) {
        if (!className) className = "DIListView";
        super(className, idName);
        if (dataSource) {
            this.dataSource = dataSource;
        }
        if (delegate) this.delegate = delegate;
        this.cellClickType = cellClickType;
        if (cellClickType === 0) {
        } else if (cellClickType === 1) {
            this.eventInfo = this.eventManager.add(this.body, "click", this.clicked);
        } else if (cellClickType === 2) {
            this.eventManager.add(this.body, "mousedown", this.mouseDown);
        }
        this.cellHeight = 0;
        this.selectedIndex = -1;

        // reloadTicket is being used to prevent updating the table when the view received a new request to update the table.
        // If there is two different thread that are trying to update the table asynchronously, this can prevent updating the view with two different requests.
        this.reloadTicket = 0;
    }

    putInSleep() {
        if (this.eventInfo) this.eventManager.stop(this.eventInfo.id);
        super.putInSleep();
    }

    wakeUp() {
        if (this.eventInfo) this.eventManager.resume(this.eventInfo.id);
        super.wakeUp();
    }

    mouseDown(evt: any) {
        if (evt.button === 0) {
            this.highlightCellAtIndex(Math.floor((this.body.scrollTop + evt.clientY - this.body.getBoundingClientRect().top) / this.cellHeight));
            // @ts-ignore TODO: not sure how to fix this
            document.documentElement.style["-webkit-user-select"] = "none";
            document.documentElement.style.cursor = "default";
            this.moveEventInfo = this.eventManager.add(document, "mousemove", this.mouseMove);
            this.upEventInfo = this.eventManager.add(document, "mouseup", this.mouseUp);
        } else if (evt.button === 2) {
        }
    }

    mouseMove(evt: any) {
        const body = this.body.getBoundingClientRect();
        if (evt.clientX > body.left && evt.clientX < body.right) {
            // If y is higher than top, top becomes y. If y is lower than bottom, bottom becomes y.
            const y = evt.clientY < body.bottom ? (evt.clientY > body.top ? evt.clientY : body.top) : body.bottom - 1;
            this.highlightCellAtIndex(Math.floor((this.body.scrollTop + y - body.top) / this.cellHeight));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mouseUp(evt: any) {
        this.eventManager.delete(this.moveEventInfo.id);
        document.documentElement.style.cursor = "";
        // @ts-ignore TODO: not sure how to fix this
        document.documentElement.style["-webkit-user-select"] = "";
        this.eventManager.delete(this.upEventInfo.id);
        this.didSelectRowAtIndex(this.selectedIndex);
    }

    highlightCellAtIndex(index: number) {
        if (this.selected === this.children[index]) return false;
        if (index < 0 || index >= this.children.length) return false;
        if (this.selected) {
            this.selected.deselect();
        }
        this.selected = this.children[index];
        this.selected.select();
        this.selectedIndex = index;
    }

    getIndex(yCoord: number) {
        return Math.floor((this.body.scrollTop + yCoord - this.body.getBoundingClientRect().top) / this.cellHeight);
    }

    moveSelection(amount: number) {
        const index = this.selected ? this.selectedIndex + amount : 0;
        if (index < 0 || index >= this.children.length) return false;
        if (this.selected) {
            this.selected.deselect();
        }
        this.selected = this.children[index];
        this.selectedIndex = index;
        this.selected.select();
        if (this.body.scrollTop > this.selected.body.offsetTop) this.body.scrollTop = this.selected.body.offsetTop;
        if (this.body.scrollTop + this.height < this.selected.body.offsetTop + this.selected.body.offsetHeight)
            this.body.scrollTop = this.selected.body.offsetTop + this.selected.body.offsetHeight - this.height;
    }

    /**
     * @param name id of the custom cell to call
     * @returns New custom cell object
     *
     * @todo finish this method or remove it
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getCustomCellById(name: string) {}

    /**
     * Clear existing cells, and update it
     */
    reloadData() {
        this.reloadTicket += 1;
        const ticket = this.reloadTicket;
        this.clearChildViews();
        this.selected = null;
        this.selectedIndex = -1;
        const length = this.dataSource.numberOfRows(this);
        for (let i = 0; i < length; i++) {
            if (this.reloadTicket === ticket) this.addChildView(this.dataSource.cellAtRow(this, i));
            else break;
        }
    }

    clicked(evt: MouseEvent) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        evt.preventDefault();
        this.didSelectRowAtIndex(Math.floor((this.body.scrollTop + evt.clientY - this.body.getBoundingClientRect().top) / this.cellHeight));
        return false;
    }

    didSelectRowAtIndex(index: number) {
        if (this.selected) {
            this.selected.deselect();
        }
        if (index < this.children.length && index >= 0) {
            this.selected = this.children[index];
            this.selected.select();
        } else {
            this.selected = null;
            index = -1;
        }
        this.selectedIndex = index;
        this.delegate.listDidSelectRowAtIndex(this, index);
    }

    delete() {
        if (this.cellClickType === 1) {
            this.eventManager.delete(this.eventInfo?.id);
        }
        this.delegate = null;
        this.dataSource = null;
        super.delete();
    }
}
