var searching = new Packages.it.maw.choc.service.node.Search(),
	jsonObj = jsonUtils.toObject(json), rootNode, rootPath, refs, page = 0;
for(var a in jsonObj){
	var value = jsonObj[a];
	if (typeof value != "string"){
		value = value.toString();
	}
	if(value!=null && value!="" && a!="alf_ticket"){
		if(a=="rootNode"){
			var rN = search.findNode(value);
			rootPath = rN.displayPath.toString()+"/"+rN.name;
			rootNode = rN.nodeRef;
		} else if(a=="term"){
			searching.term = value;
		} else if(a=="type"){
			if(Packages.it.maw.choc.model.ChocUtil.isType(value)){
				searching.type = value;
			} else {
				searching.aspects.add(value);
			}
		} else if(a=="exacttype"){
            searching.setExactType(Boolean(value));
        } else if(a=="orderby"){
			searching.orderBy = value;
		} else if(a=="orderdesc"){
			searching.setOrderDesc(Boolean(value && value=="true"));
		} else if(a=="limit"){
			searching.setLimit(parseInt(value));
		} else if(a=="noaspect"){
			searching.noAspects.add(value);
		} else if(a=="isnull"){
			searching.isNull.add(value);
		} else if(a=="page"){
			page = parseInt(value);
		} else {
			searching.properties[a.replace("_",":")] = value;
		}
	}
}

searching.page = page;

Packages.it.maw.choc.model.ServiceExecutor.execute(searching, rootNode);
if (searching.noderefs){
	refs = searching.noderefs.toArray();
	model.total = searching.total;
}
else{
	refs = [];
}
model.refs = [];
model.items = {};
model.paths = {};
for(var r in refs){
	var item = search.findNode(refs[r].toString());
	model.paths[refs[r].toString()] = item.displayPath.split("documentLibrary")[1] || "/";
	model.refs.push(refs[r].toString());
	model.items[refs[r].toString()] = appUtils.toJSON(item, true);
}