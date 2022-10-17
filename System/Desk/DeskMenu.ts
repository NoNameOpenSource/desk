import { secretaryInstance } from "../Secretary/Singleton";
import { DeskMenuListViewCell } from "./DeskMenuListViewCell";
import { DIDragListView } from "./DIDragListView";
import { DIListView } from "./DIListView";
import { DIView } from "./DIView";

export class DeskMenu extends DIView {
    _active: boolean;
    listViewContainer: DIView;
    listView: DIDragListView;
    cellHeight: number;
    // TODO: type
    contextMenu: any;
    // TODO: type
    contextList: any[];

    constructor() {
        super(null, "DeskMenu");

        // this is not active for default
        this._active = false;

        // Init list view
        this.listViewContainer = new DIView("DeskMenuViewContainer");
        this.listView;
        // @ts-ignore TODO: bug - className should be a string, but it's 2
        this.listView = new DIDragListView(this, this, 2, "ListView");
        // @ts-ignore TODO: bug
        this.listView.cellHeight = 40;
        this.listViewContainer.addChildView(this.listView);
        this.listView.body.style.width = "100%";
        this.listView.body.style.height = "100%";

        this.addChildView(this.listViewContainer);
        this.listView.reloadData();
    }

    reloadData() {
        this.listView.reloadData();
    }

    // ListView Delegate Section
    numberOfRows(listView: DIDragListView) {
        if (listView === this.listView) return secretaryInstance.appList.length;
        if (listView === this.contextMenu) return this.contextList.length;
    }

    cellAtRow(listView: DIDragListView, row: number) {
        if (listView === this.listView) {
            const cell = new DeskMenuListViewCell();
            cell.width = this.width - 32;
            cell.name.stringValue = secretaryInstance.appList[row];
            cell.icon.imageSource = "/System/Desk/Resources/AppIcon/" + secretaryInstance.appList[row] + ".png";
            return cell;
        }
    }

    listDidSelectRowAtIndex(listView: DIListView, index: number) {
        if (listView === this.listView) {
            if (index >= 0) {
                // @ts-ignore
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                listView.deselectAll();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                secretaryInstance.mainWorkSpace.loadApp(secretaryInstance.appList[index], []);
            }
        }
    }

    /**
     * @todo remove this function or finish it
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention,class-methods-use-this
    listDidHighlightedCells(_listView: any, _selecte: DIView) {}

    get width() {
        if (!this._width) this._width = this.body.offsetWidth;
        return this._width;
    }

    set width(value: number) {
        this._width = value;
        this.body.style.width = `${value}px`;
        let i = 0;
        const width = value - 32;
        for (; i < this.listView.children.length; i++) {
            this.listView.children[i].width = width;
        }
    }

    get active() {
        return this._active;
    }

    set active(value) {
        if (value) {
            this.wakeUp();
        } else {
            this.putInSleep();
        }
        this._active = value;
    }
}
