import { WorkSpace } from "../Secretary";
import { DeskEvent } from "../Secretary/DeskEvent";
import { Secretary } from "../Secretary/Secretary";
import { Desk } from "./Desk";
import { DILabel } from "./DILabel";
import { DIListView } from "./DIListView";
import { DIListViewCell } from "./DIListViewCell";
import { DIView } from "./DIView";

/**
 * This is a simple way to display an image
 */
export class DIWorkSpaceDock extends DIView {
    secretary: Secretary;
    desk: Desk;

    // TODO: should we initialize this in the constructor? It's used in listDidSelectRowAtIndex();
    // Or maybe it should exist in DIView?
    workSpaceIndex: number;
    contextMenu: DIListView;
    contextList: string[];
    contextEvent: DeskEvent;

    preventClick: DeskEvent;

    constructor(idName: string) {
        super(null, idName);
        this.secretary = Secretary.getInstance();
        this.desk = Desk.getInstance();

        // Init for context menu
        this.contextMenu = new DIListView(this, this, 1, "DIContextMenu");
        this.contextMenu.cellHeight = 25;
        this.contextList = [];
        // Init context event
        this.events.push(
            new DeskEvent(this.body, "contextmenu", (evt: MouseEvent) => {
                evt.preventDefault();
                const index = Math.floor((evt.clientY - 28) / 64); // 28 for y of this view
                this.workSpaceIndex = index;
                if (index >= 0 && index < this.secretary.workSpaces.length) {
                    if (this.secretary.workSpaces[index].loaded) {
                        if (this.secretary.workSpaces[index] === this.secretary.mainWorkSpace) this.contextList = ["Restart"];
                        else this.contextList = ["Quit"];
                    } else {
                        this.contextList = ["Open"];
                    }
                }
                this.contextMenu.reloadData();
                this.contextMenu.x = 74;
                this.contextMenu.y = 21 + 64 * index;
                this.addChildView(this.contextMenu);
                if (this.contextEvent) {
                    this.contextEvent.delete();
                    this.contextEvent = null;
                }
                this.contextEvent = new DeskEvent(document.body, "mousedown", (evt: MouseEvent) => {
                    if (
                        !(
                            this.contextMenu.body.getBoundingClientRect().left <= evt.clientX &&
                            evt.clientX <= this.contextMenu.body.getBoundingClientRect().right &&
                            this.contextMenu.body.getBoundingClientRect().top <= evt.clientY &&
                            evt.clientY <= this.contextMenu.body.getBoundingClientRect().bottom
                        )
                    ) {
                        this.clearContextMenu();
                        this.contextEvent.delete();
                        this.contextEvent = null;
                        if (evt.clientY > Desk.headerHeight && evt.clientX < 64) {
                            evt.stopPropagation();
                            evt.preventDefault();
                            if (!this.preventClick) {
                                // add the event only it is not there
                                this.preventClick = new DeskEvent(this.body, "click", (evt: Event) => {
                                    if (this.preventClick) this.preventClick.delete();
                                    evt.stopPropagation();
                                    evt.preventDefault();
                                });
                            }
                        }
                    }
                });
            })
        );
    }

    clearContextMenu() {
        this.removeChildView(this.contextMenu);
    }

    numberOfRows(listView: any) {
        if (listView === this.contextMenu) return this.contextList.length;
    }

    cellAtRow(listView: any, row: any) {
        if (listView === this.contextMenu) {
            const cell = new DIListViewCell("DIContextMenuCell");
            cell.name = new DILabel(this.contextList[row]);
            cell.addChildView(cell.name);
            return cell;
        }
        return false;
    }

    listDidSelectRowAtIndex(listView: any, index: number) {
        if (listView === this.contextMenu) {
            if (index >= 0) {
                if (this.contextEvent) {
                    this.contextEvent.delete();
                    this.contextEvent = null;
                }
                this.clearContextMenu();
                if (this.contextList[index] === "Open") {
                    this.secretary.setMainWorkSpace(this.secretary.workSpaces[this.workSpaceIndex]);
                } else if (this.contextList[index] === "Quit") {
                    this.secretary.quitWorkSpace(this.workSpaceIndex);
                    this.update();
                } else if (this.contextList[index] === "Restart") {
                }
            }
        }
    }

    update() {
        this.unplugChildViews();
        let i = 0;
        for (; i < this.secretary.workSpaces.length; i++) {
            this.addChildView(this.secretary.workSpaces[i].icon);
            this.secretary.workSpaces[i].icon.y = i * 64;
            if (this.secretary.workSpaces[i].icon.events.length < 1) {
                // TODO: use fat arrow function instead of .bind
                this.secretary.workSpaces[i].icon.events.push(
                    // eslint-disable-next-line @typescript-eslint/no-loop-func
                    new DeskEvent(this.secretary.workSpaces[i].icon.body, "click", () => {
                        // @ts-ignore
                        this.secretary.workSpaces[i].desk.workSpaceDock.clicked(this);
                    })
                );
            }
            this.secretary.workSpaces[i].icon.body.style.background = "";
            if (this.secretary.mainWorkSpace === this.secretary.workSpaces[i]) {
                this.secretary.workSpaces[i].icon.body.style.background = "rgba(52,152,219, 0.4)";
            }
        }
    }

    clicked(workSpace: WorkSpace) {
        if (!(this.secretary.mainWorkSpace === workSpace)) {
            this.secretary.setMainWorkSpace(workSpace);
        }
    }

    didMoveToDesk() {
        this._width = this.body.offsetWidth;
        this._height = this.body.offsetHeight;
    }

    get stringValue() {
        return this.textBody.textContent;
    }

    set stringValue(value) {
        this.textBody.textContent = value;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.body.style.width = `${value}px`;
    }

    delete() {
        this.textBody.remove();
        super.delete();
    }
}
