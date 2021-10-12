var parent = search.findNode(args.noderef),
	searching = new Packages.it.maw.choc.service.node.Children(),
	children = [];

//Configurazione di default per titoli e base folder
if(args.pattern){
	searching.pattern = args.pattern;
}
searching.orderBy = args.orderBy || "cm:name";
searching.orderDesc = false;

if(parent.typeShort=="tit:baseFolder" || parent.typeShort=="tit:titolo"){
    searching.orderBy = "tit:baseFolderNumber,cm:name";
} else if(parent.typeShort.indexOf("tit:")==0){
    searching.orderBy = args.orderBy || "tit:baseFolderNumber";
}

searching.orderDesc = args.orderDesc=="true";

searching.page = args.page || 0;

if (args.elements){
	searching.elements = args.elements;
}

// get children
Packages.it.maw.choc.model.ServiceExecutor.execute(searching, parent.nodeRef);
var refs = searching.noderefs.toArray();
// create json children array
for(var r in refs){
	children.push(appUtils.toJSON(search.findNode(refs[r].toString()),true));
}

var	path = parent.displayPath.split("/documentLibrary");

//Homepage dell'azienda Alfresco 4.x
//Home page dell'azienda Alfresco 5.x
model.fullPath = parent.displayPath.replace("/Home page dell'azienda/","").replace("/Homepage dell'azienda/","").replace("/Company Home/","") + "/" + parent.name;
model.path = path.length>1 ? path[1]+"/"+parent.name : "/";
model.children = children;
model.totalElements = searching.totalWithPaging;