var noderef = args.noderef,
	assocName = args.assocname,
	items = [],
	sourceAssoc = args.source=="true" ? true : false;

if (noderef){
	var node = search.findNode(noderef);
	if (assocName){
		var assocs = sourceAssoc ? node.sourceAssocs[assocName] : node.assocs[assocName];
		if (assocs){
			var obj = {
				"name": assocName,
				"elements": assocs
			}
			items.push(obj);
		}
	}
	else{
		var assocs = sourceAssoc ? node.sourceAssocs : node.assocs;
		if (assocs){
			for (i in assocs){
				var elements = assocs[i],
			  		name = utils.shortQName(i),
					obj = {
						"name": name,
						"elements": elements
					};
				items.push(obj);
			}
		}
	}
}

model.items = items;
