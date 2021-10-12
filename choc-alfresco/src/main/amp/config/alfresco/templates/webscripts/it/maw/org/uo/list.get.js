var site = siteService.getSite(args.site);
var orgContainer = site.getContainer("org");
var currentUser = person.properties["cm:userName"];

var uos = new Array();
var groups = new Array();
var pecUo = {};
uos.push(orgContainer);

// function to recurse uos (I cannot use search!)
var orgRecurse = function(uo){
	var children = uo.children;
	if(children && children.length>0){
		for(var c in children){
			var child = children[c];
			if(child.typeShort=="org:nodeUo"){
                if (child.properties['org:isGroup']) {
                    groups.push(child);
                } else {
                    uos.push(child);
                }
				orgRecurse(child);
			}
		}
	}
};
orgRecurse(orgContainer);


var orgRecurseGettingPec = function(uo){
	var children = uo.children;
	if(children && children.length>0){
		for(var c in children){
			var child = children[c];
			if(child.typeShort=="org:nodeUo"){
				if (child.properties['org:isGroup']) {
					//DO NOTHING
				} else {
					if (child.assocs["org:pecAssoc"]){
						var arrPecs = [];
						for (var p in child.assocs["org:pecAssoc"]){
							var pc = child.assocs["org:pecAssoc"][p];
							var objPec = {};
							objPec["name"] = pc.name;
							objPec["nodeRef"] = pc.nodeRef.toString();
							arrPecs.push(objPec);
						}
						pecUo[child.nodeRef.toString()] = arrPecs;
					}
				}
				orgRecurseGettingPec(child);
			}
		}
	}
};
Packages.org.alfresco.repo.security.authentication.AuthenticationUtil.setAdminUserAsFullyAuthenticatedUser();
orgRecurseGettingPec(orgContainer);
Packages.org.alfresco.repo.security.authentication.AuthenticationUtil.setFullyAuthenticatedUser(currentUser);

model.uos = uos;
model.groups = groups;
model.pecuo = pecUo;
model.root = orgContainer.nodeRef.toString();
model.title = site.title;

