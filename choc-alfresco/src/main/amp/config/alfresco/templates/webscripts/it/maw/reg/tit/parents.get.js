var node = search.findNode(args.noderef);

var parents = [];

parents = node.parents;
var parentsJSON = [];
for(var c in parents){
	parentsJSON.push(appUtils.toJSON(parents[c],true));
}

model.parents = parentsJSON;
