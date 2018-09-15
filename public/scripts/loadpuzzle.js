function onload(container, dataSource) {
	checkResources(container, dataSource)
	storeData("dataSource", dataSource)
	storeData("container", container)
	loadPuzzle(container, dataSource)
}

function reloadPuzzle(container, dataSource, force=true) {
	if(force) clearPuzzleData()
	clearPuzzle(container, dataSource)
	loadPuzzle(container, dataSource)
}

function clearPuzzle(container, dataSource) {
	addLog('Clearing Puzzle container: ' + container)
	element = document.getElementById(container)
	if (typeof(element) != 'undefined' && element != null)
	{
		parent = element.parentElement
		element.innerHTML = '<img src="images/loading.gif" class="loading_image">'
	}
}

function loadPuzzle(container, dataSource) {
	container_id = container
	addLog("Loading puzzle in " + container_id)
	new_container = document.createElement('DIV');
	new_container.id = container_id
	renderPuzzle(container_id, dataSource, new_container)
}

function checkResources(container, dataSource) {
	if (typeof(Storage) !== "undefined") {
		addLog('Storage available!')
		localStorage.clear()
	} else {
	// Sorry! No Web Storage support..
	addLog('Sorry! No Web Storage support..')
	alert('Sorry! No Web Storage support..')
	}
}

function clearPuzzleData() {
	addLog('clearing puzzle data...')
	localStorage.removeItem("puzzle_data")
}