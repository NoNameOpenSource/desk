import { WorkSpace } from "../Secretary";
import { DeskEvent } from "../Secretary/DeskEvent";
import { secretaryInstance } from "../Secretary/Singleton";
import { DILabel } from "./DILabel";
import { DIListView } from "./DIListView";
import { DIListViewCell } from "./DIListViewCell";
import { DIView } from "./DIView";
import { deskInstance } from "./Singleton";

/**
 * This is a simple way to display an image
 */
export class DIWorkSpaceDock extends DIView {
    // TODO: should we initialize this in the constructor? It's used in listDidSelectRowAtIndex();
    // Or maybe it should exist in DIView?
    workSpaceIndex: number;
    contextMenu: DIListView;
    contextList: string[];
    contextEvent: DeskEvent;

    preventClick: DeskEvent;

    constructor(idName: string) {
        super(null, idName);

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
                if (index >= 0 && index < secretaryInstance.workSpaces.length) {
                    if (secretaryInstance.workSpaces[index].loaded) {
                        if (secretaryInstance.workSpaces[index] === secretaryInstance.mainWorkSpace) this.contextList = ["Restart"];
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
                        if (evt.clientY > deskInstance.headerHeight && evt.clientX < 64) {
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
                    secretaryInstance.setMainWorkSpace(secretaryInstance.workSpaces[this.workSpaceIndex]);
                } else if (this.contextList[index] === "Quit") {
                    secretaryInstance.quitWorkSpace(this.workSpaceIndex);
                    return this.update();
                } else if (this.contextList[index] === "Restart") {
                }
            }
        }
    }

    async update() {
        this.unplugChildViews();
        let i = 0;
        for (; i < secretaryInstance.workSpaces.length; i++) {
            this.addChildView(secretaryInstance.workSpaces[i].icon);
            secretaryInstance.workSpaces[i].icon.y = i * 64;
            if (secretaryInstance.workSpaces[i].icon.events.length < 1) {
                // TODO: use fat arrow function instead of .bind
                secretaryInstance.workSpaces[i].icon.events.push(
                    // eslint-disable-next-line @typescript-eslint/no-loop-func
                    new DeskEvent(secretaryInstance.workSpaces[i].icon.body, "click", () => {
                        // @ts-ignore
                        secretaryInstance.workSpaces[i].desk.workSpaceDock.clicked(this);
                    })
                );
            }
            secretaryInstance.workSpaces[i].icon.body.style.background = "";
            if (secretaryInstance.mainWorkSpace === secretaryInstance.workSpaces[i]) {
                secretaryInstance.workSpaces[i].icon.body.style.background = "rgba(52,152,219, 0.4)";
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    clicked(workSpace: WorkSpace) {
        if (!(secretaryInstance.mainWorkSpace === workSpace)) {
            secretaryInstance.setMainWorkSpace(workSpace);
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
