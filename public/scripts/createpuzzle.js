function renderPuzzle(container, dataSource, target, data = null) {
	data = retrieveData('puzzle_data')
	if(data == null){
		// var Httpreq = new XMLHttpRequest(); // a new request
	 //    Httpreq.open("GET", dataSource, true);
	 //    Httpreq.send(null);
	 //    response = Httpreq.responseText;
	 //    var json_obj = JSON.parse(response);
	 //    addLog('Received server response: ' + response + ', of type: ' + typeof(response))
	 //    addLog('Received server json_obj: ' + json_obj + ', of type: ' + typeof(json_obj))
		$.getJSON(dataSource, function(tableData) {
			addLog('Received server data: ' + tableData + ', of type: ' + typeof(tableData))
			parseData(container, dataSource, target, tableData)
		});
	} else {
		parseData(container, dataSource, target, data)
	}
}

function parseData(container, dataSource, target, tableData) {
	var table = document.createElement('table');
	table.className = 'solver_table container text-center'
	var solved = compareSolved(tableData)
	var tableBody = document.createElement('tbody');

	tableData.forEach(function(rowData) {
		var row = document.createElement('tr');
		rowData.forEach(function(cellData) {
		var cell = document.createElement('td');
		cell.appendChild(createItem(cellData, solved));
		cell.className = 'solver_cell'
		row.appendChild(cell);
		});
		tableBody.appendChild(row);
	});
	table.appendChild(tableBody);
	container = document.getElementById(container_id)
	parent = container.parentElement
	parent.removeChild(container);
	target.appendChild(table)
	parent.appendChild(target);
	displayKudos(solved)
	storeData("puzzle_data", tableData)
}

function displayKudos(solved) {
	if(solved){
		document.getElementById("action_placeholder").innerHTML = 'Kudos!'
		celebrate()
	} else {
		document.getElementById("action_placeholder").innerHTML = 'Click the number to be moved.'
	}
}

function celebrate() {
	container_id = retrieveData("container")
	document.getElementById(container_id).innerHTML = '<img src="images/celebrations.gif">'
}

function compareSolved(puzzle_data) {
	// addLog('comparing solved? ' + JSON.stringify(puzzle_data))
	flattened = puzzle_data.reduce(function(a, b){
				     return a.concat(b);
				}, []);
	// addLog('flattened: ' + flattened)
	flattened.splice(flattened.length - 1, 1);
	copy = JSON.parse(JSON.stringify(flattened))
	sorted = copy.sort();
	// addLog('flattened minus last: ' + JSON.stringify(flattened)) // ideally zero should be the one removed..
	// addLog('flattened sorted: ' + JSON.stringify(sorted))
	isSolved = (JSON.stringify(flattened).localeCompare(JSON.stringify(sorted)) == 0)
	// addLog('isSolved: ' + isSolved)
	return isSolved
}

function createItem(data, solved) {
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
	if(!solved){
		div_elelment.onclick = function() { 
			onCellTap(this);
		};
	} else {
		document.getElementById("action_placeholder").innerHTML = ""
	}
	return div_elelment
}

function onCellTap(div_elelment){
	moveItem(div_elelment)
	addLog('A cell was clicked: ' + div_elelment.id)
}

function moveItem(div_elelment) {
	cell_data = document.getElementById(div_elelment.id).innerHTML
	puzzle_data = retrieveData("puzzle_data")
	if(IsMovableItem(cell_data, puzzle_data)){
		addLog('IsMovableItem :D !!!')
		// TODO: actually move the element and rerender the puzzle with new data.
		// div_elelment.className = "solver_item_empty"
		puzzle_data = swapWithZero(cell_data, puzzle_data)
		storeData('puzzle_data', puzzle_data)
		container = retrieveData("container")
		dataSource = retrieveData("dataSource")
		reloadPuzzle(container, dataSource, false)

	} else{
		addLog('NOT a movable item :( ')
	}
}

function swapWithZero(cell_data, puzzle_data) {
	position_cell_data = position(cell_data, puzzle_data)
	addLog('position_cell_data: ' + position_cell_data)
	position_zero = position('0', puzzle_data)
	addLog('position_zero: ' + position_zero)
	puzzle_data[position_cell_data[0]][position_cell_data[1]] = '0'
	puzzle_data[position_zero[0]][position_zero[1]] = cell_data
	addLog('new puzzle data is: ' + puzzle_data)
	return puzzle_data
}

function IsMovableItem(cell_data, puzzle_data) {
	// addLog('Cell data is: ' + cell_data + ' of type: ' + typeof(cell_data))
	// addLog('puzzle_data is: ' + puzzle_data + ' of type: ' + typeof(puzzle_data))
	return isNeighborOfZero(cell_data, puzzle_data)
}

function isNeighborOfZero(cell_data, puzzle_data) {
	position_cell = position(cell_data, puzzle_data)
	// addLog('position_cell is: ' + position_cell)
	position_zero = position('0', puzzle_data)
	// addLog('position_zero is: ' + position_zero)
	return areNeighbors(position_cell, position_zero)	
}

function areNeighbors(p1, p2) {
	return (((p1[0] == p2[0]) && (Math.abs(p1[1] - p2[1]) == 1)) || ((p1[1] == p2[1]) && (Math.abs(p1[0] - p2[0]) == 1)))
}

function position(number, twoDArrayJsonObj) {
	var col = -1
	var row = -1
	var result_col = -1
	var result_row = -1
	twoDArrayJsonObj.forEach(function(rowData) {
		col++;
		row = -1;
		rowData.forEach(function(cellData) {
			row++;
			// addLog('comparing ' + number + ' with ' + cellData)
			if(number.localeCompare(cellData) == 0) {
				// addLog('matched!!!')
				result_col = col
				result_row = row
			}
		});
	});
	return [result_col, result_row]
}

function storeData(key, data) {
	localStorage.setItem(key, JSON.stringify(data))
	retrievedData = localStorage.getItem(key)
	addLog('stored: ' + key + ', value: ' + JSON.parse(retrievedData))
}

function retrieveData(key) {
	return JSON.parse(localStorage.getItem(key))
}

function addLog(argument) {
	// console.log(argument)
}