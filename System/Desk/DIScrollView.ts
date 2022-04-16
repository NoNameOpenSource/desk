import { DIView } from "./DIView";

/**
 * This is view class for the items that will be displayed on the screen
 */
export class DIScrollView extends DIView {
    constructor(className?: string, idName?: string) {
        if (!className) className = "DIScrollView";
        super(className, idName);
    }
}
