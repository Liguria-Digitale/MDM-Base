model.success = false;
var uo = search.findNode(args.uo);
var parent = search.findNode(args.parent);

if(uo.hasAspect("st:siteContainer")){
	model.errormsg = "Non puoi spostare l'Unità Organizzativa principale!";
} else {
	var intree = false;
	var parents = parent.parents;
	for(var p in parents){
		if(parents[p].nodeRef.toString()==args.uo){
			intree = true;
			break;
		}
	}
	if(intree){
		model.errormsg = "Non puoi spostare l'Unità Organizzativa nel suo stesso albero!";
	} else {
		uo.move(parent);
		model.success = true;
	}
}
