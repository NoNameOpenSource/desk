/*
** Protocol	: DIListViewDelegate
** 
** This protocol responds for DIListView
** 
*/

protocol DIListViewDelegate  {
	/*
	** numberOfRows
	** 
	** return	: Number of the data can be displayed on listView
	** 
	** properties
	** 	-listView		: The listView that is asking for data
	**
	*/
	numberOfRows(listView)
	
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
	cellAtRow(listView, row)
}