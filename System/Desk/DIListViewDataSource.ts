import { DIListView } from "./DIListView";
import { DIListViewCell } from "./DIListViewCell";

/**
 * This provides data for the listView
 *
 * @todo implement this class
 */
export interface DIListViewDataSource {
    /**
     * @todo add member variables
     */
    constructor: () => void;

    /**
     * @param listView The listView that is asking for data
     * @returns The number of the data can be displayed on listView
     */
    numberOfRows: (listView: DIListView) => number;

    /**
     * Get the cell at a row
     *
     * @param listView The listView that is asking for data
     * @param row Index of the data/cell listView is asking for
     *
     * @returns cell object that will be used as row for listView
     */
    cellAtRow: (listView: DIListView, row: number) => DIListViewCell;
}
