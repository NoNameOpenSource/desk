import { DIImageView, DILabel, DIListViewCell } from "../Desk";

export class DrawerListViewCell extends DIListViewCell {
    icon: DIImageView;
    ending: DILabel;
    constructor() {
        super("DrawerListCell");
        this.icon = new DIImageView();
        this.addChildView(this.icon);
        this.name = new DILabel("false", "DrawerListString");
        this.addChildView(this.name);
    }

    addChildView(icon: any) {
        return true;
    }
}
