function onload(container, dataSource) {
	checkResources()
	console.log("Loading puzzle in " + container)
	$.getJSON(dataSource, function(tableData) {
	  	  var table = document.createElement('table');
	  	  table.className = 'solver_table container text-center'
		  var tableBody = document.createElement('tbody');

		  tableData.forEach(function(rowData) {
			var row = document.createElement('tr');

			rowData.forEach(function(cellData) {
			  var cell = document.createElement('td');
			  cell.appendChild(getItem(cellData));
			  cell.className = 'solver_cell'
			  row.appendChild(cell);
			});

			tableBody.appendChild(row);
		  });

		  table.appendChild(tableBody);
		  container = document.getElementById(container)
		  parent = container.parentElement
		  parent.removeChild(container);
		  setEventListeners(table)
		  parent.appendChild(table);
	});
}

function getItem(data) {
	empty = (data == 0)
	cell_id = 'solver_item_' + data
	className = "solver_item"
	if(empty) {
		data = ''
		className = "solver_item_empty"
	}
	text_Node = document.createTextNode(data);
	div_elelment = document.createElement("DIV")
	div_elelment.appendChild(text_Node)
	div_elelment.className = className;
	div_elelment.id = cell_id;
	div_elelment.onclick = function() { 
            onCellTap(this);
        };
	return div_elelment
}

function setEventListeners(table) {
	// body...
}

function onCellTap(div_elelment){
	div_elelment.innerHTML = ''
	div_elelment.className = "solver_item_empty"

	console.log('A cell was clicked: ' + div_elelment.id)
}

function checkResources() {
	if (typeof(Storage) !== "undefined") {
	} else {
	    // Sorry! No Web Storage support..
	    console.log('Sorry! No Web Storage support..')
	    alert('Sorry! No Web Storage support..')
	}
}
