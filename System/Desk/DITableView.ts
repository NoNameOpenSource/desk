import { DIView } from "./DIView";

export class DITableView extends DIView {
    dataSource: any;
    delegate: any;
    columns: any[];
    rows: any[];
    tableBody: HTMLTableElement;
    headerBody: HTMLTableRowElement;
    numberOfRows: number;

    constructor(dataSource: any, delegate: any, className?: string, idName?: string) {
        if (!className) className = "DITableView";
        super(className, idName);
        if (dataSource) this.dataSource = dataSource;
        if (delegate) this.delegate = delegate;

        this.columns = [];
        this.rows = [];

        this.tableBody = document.createElement("table");
        this.headerBody = document.createElement("tr");
        this.tableBody.appendChild(this.headerBody);
        this.body.appendChild(this.tableBody);

        this.numberOfRows = 0;
    }

    clearTable() {}

    reloadData() {
        if (!this.dataSource) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.numberOfRows = this.dataSource.numberOfRows(this);

        for (let i = 0; i < this.numberOfRows; i++) {
            this.addRow();

            for (const column of this.columns) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                const cell = this.dataSource.cellAtColRow(this, column, i);
                this.tableBody.children[i + 1].appendChild(cell.body);
            }
        }
    }

    addColumn(tableColumn: any) {
        this.columns.push(tableColumn);
        const th = document.createElement("th");
        th.innerText = tableColumn.name;
        this.headerBody.appendChild(th);
    }

    addRow() {
        const tr = document.createElement("tr");
        this.tableBody.appendChild(tr);
    }

    cellClicked(cell: any) {
        if (!this.delegate || !this.delegate.tableCellClicked) {
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
        return this.delegate.tableViewCellClicked(cell);
    }

    cellUpdated(cell: any) {
        if (!this.delegate || !this.delegate.tableCellUpdated) {
            return true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
        return this.delegate.tableCellUpdated(cell);
    }

    /**
     * @todo remove or use this function
     */
    mouseDown(_evt: any) {
        throw new Error("Method not implemented.");
    }
}
