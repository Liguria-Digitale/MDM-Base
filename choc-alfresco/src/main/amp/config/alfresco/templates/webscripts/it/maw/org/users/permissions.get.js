var user = args.user, site = args.site, userNode;
if(site==null){
	throw("Invalid parameters!");
}
if(user==null){
	user = person.properties["cm:userName"];
}
var uos = [],
    myuoslist = Packages.it.maw.choc.service.SecurityService.getUos(user, site),
    mygroupslist = Packages.it.maw.choc.service.SecurityService.getGroups(user, site),
    myuos = myuoslist.toArray();
for(var m in myuos) {
	uos.push(myuos[m].toString());
}

userNode = people.getPerson(user);
model.username = user;
model.displayname = userNode.properties["cm:firstName"]+" "+userNode.properties["cm:lastName"];
model.uos = uos;