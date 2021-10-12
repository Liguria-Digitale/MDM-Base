var type, noderef, mode = null,
	jsonObj = jsonUtils.toObject(json),
	nodehandler = new Packages.it.maw.choc.service.node.Node();

for(var a in jsonObj){
	if(a=="type"){
		type = jsonObj[a];
	} else if(a=="mode"){
		mode = jsonObj[a];
	} else if(a=="noderef"){
		noderef = jsonObj[a];
	} else {
		nodehandler.properties[a] = jsonObj[a];
	}
}

if(mode=="new"){
	nodehandler.mode = Packages.it.maw.choc.service.node.Node.ModeCreate.NEW;
} else if(mode=="edit"){
	nodehandler.mode = Packages.it.maw.choc.service.node.Node.ModeCreate.EDIT;
} else if(mode=="delete"){
	nodehandler.mode = Packages.it.maw.choc.service.node.Node.ModeCreate.DELETE;
} else {
	throw("mode not supported!");
}
nodehandler.type = type;
model.success = Packages.it.maw.choc.model.ServiceExecutor.execute(nodehandler, (noderef ? search.findNode(noderef).nodeRef : null));
model.messageStr = nodehandler.message;
model.node = nodehandler.nodeRef.toString();
