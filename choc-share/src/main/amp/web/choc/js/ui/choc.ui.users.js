/**
 * Choc @UI Module
 * @namespace Choc
*/

(function(){
	
/**
 * @UI module (appending to Choc general object)
 */
$.extend(Choc, {
	// search users
	_searchUsers: function(event){
		if(event!=null && event.keyCode!=13)return;
		var q = $("#users-filter").val();
		if(q.length>0){
			Choc.Org.searchUsers(q, false, false, -1, function(users){
                $("#users-list").html(Choc._render(Choc.mustache_url + "users.list.ejs", {
                    users: users
                }));
			});
		} else {
			Choc.poptime("Inserisci almeno un carattere...","warning");
		}
	},
	// create user
	_createUser: function(){
		Choc.Picker.putCode({
			header: "Nuovo Utente",
			body: "<div id='users-creation'></div>",
			go: function(data){
				Choc.Org.createUser(data, function(user){
					if(user.success){
						Choc.Picker.code.destroy();
						Choc.alert("Utente creato con successo!<br/>Tra pochi secondi sarà disponibile nei risultati della ricerca!");
					} else {
						Choc.alert("Errore imprevisto! Forse esiste già un utente con questo username?","danger");
					}
				});
			}
		});
		Choc.Picker.code.confirm.remove();
		Choc.Forms.draw({
			type: "cm:person",
			form: "create",
			container: $("#users-creation"),
			submit: Choc.Picker.code.go
		});
	},
	// edit user
	_editUser: function(el){
		var username = $(el).parents("[data-username]").data("username");
		Choc.Picker.putCode({
			header: "Modifica Utente '"+username+"'",
			body: "<div id='users-edit'></div>",
			go: function(data){
				Choc.Org.editUser(username, data, function(success){
					if(success){
						Choc.Picker.code.destroy();
						Choc.poptime("Utente modificato con successo!");
						Choc._searchUsers();
					} else {
						alert("Errore imprevisto!");
						location.reload();
					}
				});
			}
		});
		Choc.Picker.code.confirm.remove();
		Choc.Forms.draw({
			type: "cm:person",
			form: "edit",
			container: $("#users-edit"),
			submit: Choc.Picker.code.go
		});
		var users = Choc.Org.lastSearch;
		for(var u in users){
			var user = users[u];
			if(user.username==username){
				Choc.Picker.code.body.find(".ui.form").form("set values", {
					name: user.name,
					surname: user.surname,
					email: user.mail
				});
				break;
			}
		}
	},
	// delete user
	_deleteUser: function(el){
		var username = $(el).parents("[data-username]").data("username");
		Choc.confirm({
			message: "Confermi l'eliminazione dell'utente '"+username+"'?",
			approve: function(){
				Choc.Org.deleteUser(username, function(){
					Choc.poptime("Utente eliminato!");
					Choc._searchUsers();
				});
			}
		});
	},
	// reset user password
	_resetUserPw: function(el){
		var username = $(el).parents("[data-username]").data("username");
		Choc.Picker.putCode({
			header: "Reset password utente '"+username+"'",
			body: "<div id='users-password'></div>",
			go: function(data){
				if(data.pass!=data.pass2){
					Choc.poptime("Le password non coincidono!","danger");
				} else {
					Choc.Org.setUserPassword(username, null, data.pass, function(res){
						res.username = username;
						Choc._changeUserPwCallback(res);
					});
				}
			}
		});
		Choc.Picker.code.confirm.remove();
		Choc.Forms.draw({
			type: "cm:person",
			form: "password",
			container: $("#users-password"),
			submit: Choc.Picker.code.go
		});
	}
});
	
})();
