import { DIImageView } from "./DIImageView";
import { DILabel } from "./DILabel";
import { DIListViewCell } from "./DIListViewCell";

export class DeskMenuListViewCell extends DIListViewCell {
    icon: DIImageView;
    name: DILabel;

    constructor() {
        super("DeskMenuListCell");
        this.icon = new DIImageView();
        this.addChildView(this.icon);
        this.name = new DILabel(undefined, "DeskMenuListString");
        this.addChildView(this.name);
    }
}
