var jsonObj = jsonUtils.toObject(json),
	user = people.getPerson(jsonObj.user);
if(user==null){
	model.user = people.createPerson(jsonObj.user, jsonObj.name, jsonObj.surname, jsonObj.email, jsonObj.pass, true);
} else {
	model.user = null;
}
