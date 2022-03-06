import { DIListView } from "./DIListView";
import { DIListViewCell } from "./DIListViewCell";

/**
 * This protocol responds for DIListView
 */
export interface DIListViewDelegate {
    /**
     * Number of the data can be displayed on listView
     *
     * @param listView The listView that is asking for data
     */
    numberOfRows: (listView: DIListView) => number;

    /**
     * Cell object that will be used as row for listView
     *
     * @param listView The listView that is asking for data
     * @param index Index of the data/cell listView is asking for
     */
    cellAtRow: (listView: DIListView, row: number) => DIListViewCell;
}
