function renderPuzzle(container, dataSource, target, data = null) {
	data = retrieveData('puzzle_data')
	if(data == null){
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
		setActionNotification('Kudos!')
		celebrate()
	} else {
		setActionNotification('Click the number to be moved.')
	}
}

function celebrate() {
	total_timeout = 2000
	greenifyCellsAnimate(total_timeout)
	setTimeout(function(){ 
		document.getElementById(container_id).innerHTML = '<img src="images/celebrations.gif">'
	 }, total_timeout);
}

function greenifyCellsAnimate(total_timeout) {
	child_nodes = document.getElementById(container_id).childNodes
	addLog('child_nodes[0]: ' + child_nodes[0])
	puzzle_data = retrieveData("puzzle_data")
	total_elements = puzzle_data.length * puzzle_data[0].length
	addLog('total elements: ' + total_elements)
	puzzle_table = child_nodes[0]
	for (var i = 0, row; row = puzzle_table.rows[i]; i++) {
		for (var j = 0, col; col = row.cells[j]; j++) {
			if(col.childNodes[0].innerHTML != ''){
				timeout = ((i + 1) + (j + 1)) * total_timeout / total_elements
				setTimeout(function(col_id, timeout){ 
					document.getElementById(col_id).className = 'solver_item solved'
				 }, timeout, col.childNodes[0].id, parseInt(col.childNodes[0].innerHTML, 10));
			}
		}  
	}
}

function compareSolved(puzzle_data) {
	addLog('comparing solved? ' + JSON.stringify(puzzle_data))
	flattened = puzzle_data.reduce(function(a, b){
		return a.concat(b);
	}, []);
	addLog('flattened: ' + flattened)
	flattened.splice(flattened.length - 1, 1);
	copy = JSON.parse(JSON.stringify(flattened))
	function sortNumber(a,b) {
		return a - b;
	}
	sorted = copy.sort(sortNumber);
	addLog('flattened minus last: ' + JSON.stringify(flattened)) // ideally zero should be the one removed..
	addLog('flattened sorted: ' + JSON.stringify(sorted))
	isSolved = (JSON.stringify(flattened).localeCompare(JSON.stringify(sorted)) == 0)
	addLog('isSolved: ' + isSolved)
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
	puzzle_data[position_cell_data[0]][position_cell_data[1]] = 0
	puzzle_data[position_zero[0]][position_zero[1]] = parseInt(cell_data, 10)
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

function setActionNotification(message) {
	document.getElementById("action_placeholder").innerHTML = message
}