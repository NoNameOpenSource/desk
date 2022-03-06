import { DIView } from "./DIView";
import { DILabel } from './DILabel'

/**
 * Cell for the view
 */
export class DIListViewCell extends DIView {
    selected: boolean;
	name: DILabel;

    /**
     * @param listCell Class that will be used for make cells
     * @param cell Array of the cells
     */
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
