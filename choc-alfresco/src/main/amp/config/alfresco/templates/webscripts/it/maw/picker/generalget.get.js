var nodes = args.nodes;
var elements = [];

if (nodes){
	var nodeArray = nodes.split(";");
	for (var i = 0; i < nodeArray.length; i++) {
		if (nodeArray[i].length>=25){ //MIN CHAR FOR ONLY 1 NODEREF)
			elements.push(search.findNode(nodeArray[i]));
		}
	}
}

model.elements = elements;
