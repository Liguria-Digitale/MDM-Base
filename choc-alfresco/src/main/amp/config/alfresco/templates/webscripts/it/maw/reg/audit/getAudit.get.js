model.results = search.query({
	language: "db-cmis",
	query: "select cmis:objectId from audit:auditEntity where audit:referenceNodeRef='"+args.noderef+"' order by audit:date desc"
});
