import { DILabel } from "./DILabel";
import { DIView } from "./DIView";

/**
 * Cell for the view
 *
 * -listCell		: Class that will be used for make cells
 * -cell			: Array of the cells
 */
export class DIListViewCell extends DIView {
    selected: boolean;
    name: DILabel;

    constructor(className?: string, idName?: string) {
        if (!className) className = "DIListCell";
        super(className, idName);
        this.selected = false;
    }

    select() {
        if (!this.selected) {
            this.body.className = this.body.className.concat("Selected");
            this.selected = true;
        }
    }

    deselect() {
        if (this.selected) {
            this.body.className = this.body.className.substring(0, this.body.className.length - 8);
            this.selected = false;
        }
    }
}
