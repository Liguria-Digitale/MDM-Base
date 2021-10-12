var q = args.q;
var onlyMember = false;
var site = null;
if(args.site){
	onlyMember = true;
	site = siteService.getSite(args.site);
}
// prendo il parametro per il massimo numero di risultati
var max = args.max;
if(max==null){
	max = 10;
} else if(max==-1){
	max = 250;
}

var users = people.getPeople(q, 250);
var usersF = new Array();

if(onlyMember){
	var cont = 0;
	for(var u in users){
		var user = search.findNode(users[u]);
		if(site.isMember(user.properties["cm:userName"])){
			usersF.push(user);
			cont++;
			if(cont>max){
				break;
			}
		}
	}
} else {
	if(users.length>max){
		users = users.slice(0,max);
	}
	for(var u in users){
		usersF.push(search.findNode(users[u]));
	}
}

model.users = usersF;
model.uo = args.uo=="true" ? true : false;