/*
** Class	: DIListViewDataSource
** 
** This provides data for the listView
** 
** properties
**	-nothingYet		: Things will get added to here
**
*/

class DIListViewDataSource  {
	constructor() {
	}
	
	/*
	** numberOfRows
	** 
	** return	: Number of the data can be displayed on listView
	** 
	** properties
	** 	-listView		: The listView that is asking for data
	**
	*/
	numberOfRows(listView) {
		return 0;
	}
	
	/*
	** cellAtRow
	** 
	** return	: Cell object that will be used as row for listView
	** 
	** properties
	** 	-listView		: The listView that is asking for data
	**	-row			: Index of the data/cell listView is asking for
	**
	*/
	cellAtRow(listView, row) {
		return null;
	}
}