var mode = args.mode;
var q = args.q;
var page = args.page || 0;
var site = siteService.getSite(args.site);
var query = null;

if(mode=="tit") {
	var doclib = site.getContainer("documentLibrary");
	query = "select cmis:objectId from tit:baseFolder where in_tree('" + doclib.nodeRef.toString() + "')";
	if (q.length > 0) {
		query += " and cmis:name='*" + q + "*'";
	}
	query += " order by cmis:lastModificationDate desc";
} else if(mode=="doc"){
	var doclib = site.getContainer("documentLibrary"), sharedFolder = site.getContainer("shared"),
		homeFolder = site.getContainer("homes").childByNamePath(person.properties["cm:userName"]);
	query = "select cmis:objectId from cmis:document where (in_tree('" + doclib.nodeRef.toString() + "')";
	query += " or in_tree('" + sharedFolder.nodeRef.toString() + "') or in_tree('" + homeFolder.nodeRef.toString() + "'))"
	if (q.length > 0) {
		query += " and cmis:name='*" + q + "*'";
	}
	query += " order by cmis:lastModificationDate desc";
} else {
	throw("Not valid parameters");
}

var auditsModel = Packages.it.maw.choc.util.audit.AuditUtil.getAudits(query, page, 8, args.site),
	auditList = auditsModel.noderefs.toArray(),
	total = auditsModel.total;
	audits = [];


model.totalElements = total;

for(var auditNode in auditList){
	var audit = search.findNode(auditList[auditNode]);
  	audits.push(audit);	
}

logger.debug("Query return " + audits.length + " elements");
var nameMap = {};
var dateMap = {};

model.mode = mode;
model.audits = audits;
model.nameMap = nameMap;
model.dateMap = dateMap;