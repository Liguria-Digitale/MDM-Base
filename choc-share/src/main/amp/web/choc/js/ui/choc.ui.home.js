/**
 * Choc @UI Module
 * @namespace Choc
*/

(function(){
	
/**
 * @UI module (appending to Choc general object)
 */
$.extend(Choc, {
	// user is admin
	_isAdmin: false,
	// enable delete aoo
	_enableAooDelete: false,
	// draw aoo list
	_listAoo: function(){
		Choc.Org.getAoos(Choc._drawAoo);
	},
	_drawAoo: function(offices){
        var ul = $("#org-aoo");
        ul.empty();
        if($.isEmptyObject(offices) || !Array.isArray(offices)){
            ul.append("<h3></h3><h3 class='ui blue header'>Nessuna AOO disponibile</h3>");
        } else {
            for(var o in offices){
                var office = offices[o];
                var html = "<div class='ui card' data-aoo='"+office.shortName+"' data-noderef='"+office.noderef+"'><div class='content'><div class='ui center aligned icon small header'>";
                html += "<a href='"+location.context+"/page/site/"+office.shortName+"/desktop'><i class='icon sitemap'></i>"+office.title;
                html += "</a></div></div>";
                if(Choc._isAdmin && Choc._enableAooDelete){
                    html += "<div onclick='Choc._deleteAoo(this);' class='ui red corner label cursor pointer'><i class='icon remove'></i></div>";
                }
                html += "</div>"
                ul.append(html);
            }
        }
    },
	// add aoo
	_addAoo: function(){
		var html = "<div class='ui warning form' id='aoo-creation'>";
		html += "<div class='ui warning message'><div class='header'>Attenzione</div>";
		html += "Si consiglia di usare massimo 3 o 4 caratteri</div>";
		html += "<div class='field'><label>Nome</label><input type='text' name='name'></div>";
		html += "<div class='field'><label>Codice</label><input type='text' name='prefix'></div>";
		html += "</div>";
		Choc.Picker.putCode({
			header: "Nuova AOO",
			body: html,
			gohtml: "<i class='icon plus'></i>Crea",
			go: function(){
				$("#aoo-creation").form("validate form");
			}
		});
		$("#aoo-creation").form({
			fields: {
				name: {
					rules: [{
						type   : 'empty',
						prompt : 'Il nome è obbligatorio'
					}]
				},
				prefix: {
					rules: [{
						type   : 'empty',
						prompt : 'Il codice è obbligatorio'
					}]
				}
			},
			inline: true,
			onSuccess: function(values){
				var values = $("#aoo-creation").form("get values");
				Choc.poptime("Creazione AOO in corso...","info");
				Choc.Org.createAoo(values.name, values.prefix, function(res){
					if(res.success){
						Choc._listAoo();
						Choc.alert("L'AOO '"+values.name+"' è stato creato con successo");
						Choc.Picker.code.destroy();
					} else {
						Choc.alert("Errore durante la creazione dell'AOO! Codice già utilizzato?","danger");
					}
				});
			}
		});
	},
	// delete AOO
    _deleteAoo: function(labelEl){
        Choc.confirm({
            message: "Vuoi davvero eliminare l'AOO? Sarà eliminato l'intero contenuto!",
            approve: function(){
                var noderef = $(labelEl).parents("[data-noderef]").data("noderef");
                Choc.Docs.aspects(noderef, [], ["sys:hidden"], function(){
                    var aoo = $(labelEl).parents("[data-aoo]").data("aoo");
                    Choc.Org.deleteAoo(aoo, function(success){
                        if(success){
                            Choc.poptime("AOO rimossa con successo");
                        } else {
                            Choc.poptime("Impossibile rimuovere AOO!", "danger");
                        }
                        Choc._listAoo();
                    });
                });
            }
        });
    }
});
	
})();
