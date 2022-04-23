import { DIButton } from "../Desk/DIButton";
import { DIView } from "../Desk/DIView";
import { Application } from "./Application";
import { Drawer } from "./Drawer";

export class DrawerOpenPanel extends DIView {
    type: string;
    drawerPanelContainer: DIView;
    drawer: Drawer;
    cancelButton: DIButton;
    openButton: DIButton;
    delegate: Application;

    constructor(delegate: Application) {
        super("DrawerPanel");

        this.type = "openPanel";

        this.drawerPanelContainer = new DIView("DrawerPanelContainer");
        this.drawerPanelContainer.x = 10;
        this.drawerPanelContainer.width = 340;
        // @ts-ignore TODO: what is Drawer?
        this.drawer = new Drawer(Secretary.mainWorkSpace, "DrawerPanel", { drawerType: "openPanel" });
        this.drawer.window.closeButton.hidden = true;
        this.drawer.window.minButton.hidden = true;
        this.drawer.minWidth = 340;
        this.drawer.window.width = this.drawer.minWidth;
        this.drawerPanelContainer.addChildView(this.drawer.window);
        this.addChildView(this.drawerPanelContainer);

        // add cancel button
        this.cancelButton = new DIButton("Cancel", "DISmallAlertViewButton");
        this.cancelButton.setButtonEvent(this.cancel.bind(this));
        this.cancelButton.body.style.top = "calc(100% - 273px)";
        this.cancelButton.body.style.width = "calc(50% - 10px)";
        this.cancelButton.body.style.right = "10px";
        this.addChildView(this.cancelButton);

        // add open button
        this.openButton = new DIButton("Open", "DISmallAlertViewButton");
        this.openButton.setButtonEvent(this.open.bind(this));
        this.openButton.body.style.top = "calc(100% - 273px)";
        this.openButton.body.style.width = "calc(50% - 10px)";
        this.openButton.body.style.left = "10px";
        this.addChildView(this.openButton);

        this.delegate = delegate;
    }

    cancel() {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.delegate.drawerPanelCanceled();
    }

    open() {
        // @ts-ignore TODO: selected is not an array
        if (this.drawer.listView.selected.length !== 1) {
            return;
        }
        // @ts-ignore TODO: selected is not an array
        const fileIndex = this.drawer.listView.selected[0];
        const file = this.drawer.listData[fileIndex];
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.delegate.drawerPanelSelected(file);
    }
}
