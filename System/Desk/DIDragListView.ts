import { DeskEvent } from "../Secretary/DeskEvent";
import { DIListView } from "./DIListView";
import { DIListViewCell } from "./DIListViewCell";
import { DIView } from "./DIView";

/**
 * Displays a draggable list
 *
 * -cell			: Array of the cells
 * -dataSource		: Object that will provide data to make list
 */
export class DIDragListView extends DIListView {
    events: DeskEvent[];
    body: HTMLElement;
    lastHighlightedCell: number;
    multipleSelection: boolean;
    children: DIListViewCell[];

    constructor(dataSource: any, delegate: any, className: string, idName: string) {
        super(dataSource, delegate, -1, className, idName);

        this.events.push(new DeskEvent(this.body, "mousedown", (evt: MouseEvent) => this.mouseDown(evt)));

        // @ts-ignore TODO: bug - array instead of single item
        this.selected = [];
        this.lastHighlightedCell = -1;

        this.multipleSelection = true;
    }

    mouseDown(evt: MouseEvent) {
        if (evt.button === 0) {
            this.deselectAll();
            this.selectedIndex = Math.floor((this.body.scrollTop + evt.clientY - this.body.getBoundingClientRect().top) / this.cellHeight);
            if (this.selectedIndex >= 0 && this.selectedIndex < this.children.length) {
                evt.preventDefault();

                this.highlightCellAtIndex(this.selectedIndex);
                this.moveEvent = this.events.length;

                document.documentElement.style.userSelect = "none";
                document.documentElement.style.cursor = "default";

                this.events.push(new DeskEvent(document, "mousemove", (evt: MouseEvent) => this.mouseMove(evt)));
                this.events.push(new DeskEvent(document, "mouseup", (evt: MouseEvent) => this.mouseUp(evt)));

                if (!this.multipleSelection) {
                    this.mouseUp(evt);
                }
            } else {
                this.delegate.listDidHighlightedCells(this, this.selected);
            }
        } else if (evt.button === 2) {
        }
    }

    mouseMove(evt: MouseEvent) {
        if (evt.button === 0) {
            const body = this.body.getBoundingClientRect();
            if (evt.clientX > body.left && evt.clientX < body.right) {
                // If y is higher than top, top becomes y. If y is lower than bottom, bottom becomes y.
                const index = Math.floor((this.body.scrollTop + evt.clientY - this.body.getBoundingClientRect().top) / this.cellHeight);
                this.dragToIndex(index);
            }
        }
    }

    mouseUp(evt: MouseEvent) {
        if (evt.button === 0) {
            this.events[this.moveEvent].delete();

            document.documentElement.style.cursor = "";
            document.documentElement.style.userSelect = "";

            this.events[this.moveEvent + 1].delete();
            this.events.splice(this.moveEvent, 2);

            const body = this.body.getBoundingClientRect();
            const index = Math.floor((this.body.scrollTop + evt.clientY - body.top) / this.cellHeight);

            if (index === this.selectedIndex) {
                this.didSelectRowAtIndex(this.selectedIndex);
            } else {
                // @ts-ignore
                this.selected.length = 0;
                for (let i = 0; i < this.children.length; i++) {
                    // @ts-ignore TODO: bug - treated as array instead of single item
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    if (this.children[i].selected) this.selected.push(i);
                }
                if (this.delegate.listDidHighlightedCells) this.delegate.listDidHighlightedCells(this, this.selected);
            }
        }
    }

    dragToIndex(index: number) {
        if (index === 6) {
        }
        if (this.lastHighlightedCell - index > 0) {
            const j = this.lastHighlightedCell - index;
            const lastIndex = this.lastHighlightedCell;
            let i = 1;
            for (; i <= j; i++) {
                this.dragOnIndex(lastIndex - i);
            }
        } else {
            const j = index - this.lastHighlightedCell;
            const lastIndex = this.lastHighlightedCell;
            let i = 1;
            for (; i <= j; i++) {
                this.dragOnIndex(lastIndex + i);
            }
        }
    }

    dragOnIndex(index: number) {
        if (index !== this.lastHighlightedCell) {
            if (this.lastHighlightedCell > index && this.lastHighlightedCell > this.selectedIndex) {
                this.children[this.lastHighlightedCell].deselect();
            } else if (this.lastHighlightedCell < index && this.lastHighlightedCell < this.selectedIndex) {
                this.children[this.lastHighlightedCell].deselect();
            }
        }
        this.highlightCellAtIndex(index);
    }

    highlightCellAtIndex(index: number) {
        if (index < 0 || index >= this.children.length) return false;
        if (!this.children[index].selected) {
            this.children[index].select();
        }
        this.lastHighlightedCell = index;
    }

    deselectAll() {
        // @ts-ignore
        if (this.selected.length > 0) {
            let i = 0;
            // @ts-ignore
            for (; i < this.selected.length; i++) {
                // @ts-ignore
                this.children[this.selected[i]].deselect();
            }
            // @ts-ignore
            this.selected.length = 0;
        }
    }

    /**
     * New custom cell object
     * @param name
     * @todo use or remove this function
     */
    getCustomCellById(_name: string) {
        throw new Error("Method not implemented.");
    }

    /**
     * This clears existing cells, and update it
     */
    reloadData() {
        this.reloadTicket += 1;
        const ticket = this.reloadTicket;
        const scrollPos = this.body.scrollTop;
        this.clearChildViews();
        // @ts-ignore
        this.selected.length = 0;
        this.selectedIndex = -1;
        const length = this.dataSource.numberOfRows(this);
        for (let i = 0; i < length; i++) {
            if (this.reloadTicket === ticket) {
                const cell = this.dataSource.cellAtRow(this, i);
                this.addCell(cell);
            } else break;
        }
        if (this.reloadTicket === ticket) this.body.scrollTop = scrollPos;
    }

    addCell(cell: DIView) {
        cell.y = this.children.length * this.cellHeight;
        this.addChildView(cell);
    }

    didSelectRowAtIndex(index: number) {
        this.deselectAll();
        if (index < this.children.length && index >= 0) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.selected.push(index);
            this.children[index].select();
        } else {
            index = -1;
        }
        this.selectedIndex = index;
        this.delegate.listDidSelectRowAtIndex(this, index);
    }

    delete() {
        this.delegate = null;
        this.dataSource = null;
        if (this.cellClickType === 1) {
            if (this.event) {
                this.event.delete();
                this.event = null;
            }
        }
        super.delete();
    }
}
