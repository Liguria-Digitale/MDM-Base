model.success = false;

var name = args.name;
var prefix = args.prefix.toLowerCase();
// controllo che non esista già un sito col lo stesso prefix
if(siteService.getSite(prefix)!=null){
	throw("Prefisso già utilizzato per altro aoo!");
}

var aoo = siteService.createSite("choc-site", prefix, name, name, "PRIVATE");
if(aoo==null){
	throw("Errore durante la creazione dell'aoo");
}
groups.getGroup("site_"+prefix+"_SiteConsumer").displayName = "Utenti AOO "+name;


// #### CONTAINER
// organigramma
var uo = Packages.it.maw.choc.util.OrgUtil.createUO("org", aoo.node.nodeRef);
//associo l'utente corrente a org
Packages.it.maw.choc.util.OrgUtil.addUserToUo(person.properties["cm:userName"], uo);
// creo documentlibrary
var doclib = search.findNode(Packages.it.maw.choc.util.AooUtil.createChocContainer("documentLibrary", aoo.shortName, "tit:baseFolder"));
// tutti gli altri
Packages.it.maw.choc.util.AooUtil.createChocContainer("auditLists", aoo.shortName);
Packages.it.maw.choc.util.AooUtil.createChocContainer("shared", aoo.shortName);
Packages.it.maw.choc.util.AooUtil.createChocContainer("homes", aoo.shortName);
Packages.it.maw.choc.util.AooUtil.createChocContainer("config", aoo.shortName);

// nella doclib creo delle cartelle di default (e audit)
var titolo = doclib.createNode("Documenti Digitali", "tit:titolo", {"tit:baseFolderNumber":0});
var classe = titolo.createNode(new Date().getFullYear(), "tit:classe", {"tit:baseFolderNumber":1});
classe.createNode("Uploads", "tit:fascicolo");

// sys hidden (no site visible from share)
aoo.node.addAspect("sys:hidden");

// fine
model.aoo = aoo.node;
model.success = true;
