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
		if(!className)
			className='DITableView';
		super(className, idName);
		if(dataSource)
			this.dataSource = dataSource;
		if(delegate)
			this.delegate = delegate;

		this.columns = new Array();
		this.rows = new Array();

		this.tableBody = document.createElement("table");
		this.headerBody = document.createElement("tr");
		this.tableBody.appendChild(this.headerBody);
		this.body.appendChild(this.tableBody);

		this.numberOfRows = 0;
	}

	clearTable() {
	}

	reloadData() {
		if(!this.dataSource) { return; }

		this.numberOfRows = this.dataSource.numberOfRows(this);
		for(let i = 0; i < this.numberOfRows; i++) {
			this.addRow();
			for(let j = 0; j < this.columns.length; j++) {
				let cell = this.dataSource.cellAtColRow(this, this.columns[j], i);
				this.tableBody.children[i + 1].appendChild(cell.body);
			}
		}
	}

	addColumn(tableColumn: any) {
		this.columns.push(tableColumn);
		let th = document.createElement("th");
		th.innerText = tableColumn.name;
		this.headerBody.appendChild(th);
	}

	addRow() {
		let tr = document.createElement("tr");
		this.tableBody.appendChild(tr);
	}

	cellClicked(cell: any) {
		if(!this.delegate || !this.delegate.tableCellClicked) { return true; }
		return this.delegate.tableViewCellClicked(cell);
	}

	cellUpdated(cell: any) {
		if(!this.delegate || !this.delegate.tableCellUpdated) { return true; }
		return this.delegate.tableCellUpdated(cell);
	}

	/**
	 * @todo finish function or remove
	 */
	mouseDown(evt) {
	}
}