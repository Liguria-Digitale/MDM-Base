/**
 * Choc draw Module
 * @namespace Choc
*/

(function(){
	
/**
 * @UI module (appending to Choc general object)
 */
// generic functions
$.extend(Choc, {
	// paging oject
	Pagination: function (config) {
        /**
         * Create pagination element and inject it into html
         * @param config element for passing page change functions
		 * how to use: create a pagination object: pagObj = new Choc.Pagination({...})
		 * after get server items, set total elements and call update: pagObj.total = res.total; pagObj.update();
		 * in constructor, you must pass html container. Optionally, you can pass function to call in actions
         */
        this.config = config;
        this.page = config.page || 0;
        this.elements = config.elements || 15;
        this.total = null;
        this.small = config.small!=null ? config.small : false;
        // public function to call outside for update pagination html
        this.update = function(){
        	var container = $(this.config.container);
        	container.empty();
            container.html(Choc._render(Choc.mustache_url + "pagination.ejs", this));
            container.find(".prev-action").click(this.prev);
            container.find(".next-action").click(this.next);
            container.find(".number-action").click(this.number);
            container.find(".goto-action").click(this.goTo);
            container.find(".goto").click(function () {
                container.find('.paginator').transition({duration: 0});
                container.find('.pageLauncher').transition({duration: 0});
            });

		};
		var me = this;
		// function for prev action
		this.prev = function(){
            if (me.page > 0) {
                me.page--;
                if(me.config.prev){
                    me.config.prev();
				}
            }
            me.every();
		};
		// function for next action
		this.next = function(){
            me.page++;
            if(me.config.next){
                me.config.next();
            }
            me.every();
		};
		// function for number action
		this.number = function(){
            me.page = $(this).data('page');
            if(me.config.goTo){
                me.config.goTo();
            }
            me.every();
		};
		// fucntion for goto action
		this.goTo = function(){
			var contEl = $(me.config.container), page = contEl.find('.choosePag').val();
            if (page) {
                var realPage = ((me.total / me.elements) % 1 != 0) ? Math.floor(me.total / me.elements) + 1 : me.total / me.elements;
                if (page >= 1 && realPage > page - 1) {
                    me.page = page - 1;
                    if(me.config.goTo){
                        me.config.goTo();
                    }
                    me.every();
                } else {
                    Choc.poptime("Pagina non disponibile", "warning");
                }
            } else {
                contEl.find('.paginator').transition({duration: 0});
                contEl.find('.pageLauncher').transition({duration: 0});
			}
		};
		// function to call on every page change. Can be empty
		this.every = this.config.every || $.noop;
		return this;
    },
	// render template with can framework
	_render: function(template, scope, helpers){
		var body = $(can.view(template, scope || {}, helpers || {}));
		body.localize();
		return body;
	},
	// function to change user password
	_changeUserPw: function(){
		var html = "<div class='ui form'><div class='field'><label>Vecchia password</label>";
		html += "<input type='password' class='user-setpw-oldpw' placeholder='Vecchia password' /></div>";
		html += "<div class='field'><label>Nuova password:</label>";
		html += "<input type='password' class='user-setpw-newpw' placeholder='Nuova password' /></div>";
		html += "<div class='field'><label>Conferma password:</label>";
		html += "<input type='password' class='user-setpw-newpw2' placeholder='Conferma password'/></div></div>";
		Choc.Picker.putCode({
			body: html,
			header: "Cambia password",
			go: function(){
				var oldpass = $(".user-setpw-oldpw").val();
				var pass1 = $(".user-setpw-newpw").val();
				var pass2 = $(".user-setpw-newpw2").val();
				if(oldpass.length<3){
					Choc.poptime("Inserisci la password corrente!","warning");
				} else if(pass1!=pass2){
					Choc.poptime("Le password non coincidono!","danger");
				} else if(pass1.length<3){
					Choc.poptime("La password deve essere di almeno 3 caratteri!","warning");
				} else {
					Choc.Org.setUserPassword(Choc.user.id, oldpass, pass1, Choc._changeUserPwCallback);
				}
			}
		});
	},
	_changeUserPwCallback: function(res){
        if(res.success){
            Choc.poptime("Password modificata correttamente!");
        } else {
            Choc.alert("Impossibile modificare la password!<br/>Inserisci correttamente la password corrente!","danger");
        }
        Choc.Picker.code.destroy();
    },
	_editUserProfile: function(){
		Choc.Org.getUser(Choc.user.id, function(user) {
			if (user.capabilities.isMutable){
				Choc.Picker.putCode({
					header: "Modifica Utente '"+user.userName+"'",
					body: "<div id='users-edit'></div>",
					go: function(data){
						Choc.Org.editUser(user.userName, data, function(success){
							if(success){
								Choc.Picker.code.destroy();
								Choc.poptime("Utente modificato con successo. Le modifiche saranno applicate al prossimo accesso");
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
				Choc.Picker.code.body.find(".ui.form").form("set values", {
					name: user.firstName,
					surname: user.lastName,
					email: user.email
				});
			}
			else{
				Choc.poptime("Profilo non modificabile", "warning");
			}				
		});
	},
	// web guide
	_guideUsername: "manuale",
	_guidePassword: "mdm4user",
    _gotoGuide: function () {
		var html = "<div class='ui info message'>Puoi consultare il manuale web attraverso questo link: ";
		html += "<a target='blank' href='https://manuale.mawgroup.it'>Manuale web</a><br>";
		html += "Potrai accedere con username <b><i>"+Choc._guideUsername+"</i></b> e password <b><i>"+Choc._guidePassword+"</i></b>";
		html += "</div>";
		Choc.confirm({
			message: html,
            hideButtons: true
		});
    }
});
	
})();
