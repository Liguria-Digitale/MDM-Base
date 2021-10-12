/**
 * Choc @UI Module
 * @namespace Choc
*/

(function(){
	
$(document).ready(function() {

    $("#choc-org-div #org-actions-toolbar .ui.floating.dropdown").dropdown({
        action: 'hide'
    });

    Choc.Docs.getContainer("org", function(node){
        Choc._setupChart(node.nodeRef);
    });

    $('.help-popup').popup();
});
	
/**
 * @UI module (appending to Choc general object)
 */
$.extend(Choc, {
    // show or not disabled uos
    _showDisabledUOs: false,
	// selected uo
	_currentUO: null,
	// boolean for move active
	_isMoveActive: false,
	// boolean for current Uo disabled
	_isUoDisabled: false,
	// create new uo and draw
	_createUO: function(e){
        e.stopPropagation();
		var html = "<div class='ui labeled fluid input'><div class='ui label'>Nome nuova UO</div>";
		html += "<input type='text' onkeydown='Choc.Picker.code.go(event);' id='choc-uo-create'></div>";
		Choc.Picker.putCode({
			header: "Nuova Unità Organizzativa",
			body: html,
			gohtml: "<i class='icon sitemap'></i>Crea",
			go: function(event){
				if(event!=null && event.keyCode!=13)return;
				var name = $.trim($("#choc-uo-create").val());
				if(name.length<1){
					Choc.poptime("Non hai inserito il nome per la nuova UO!","warning");
					return;
				}
				Choc.Org.createUo(name, Choc._currentUO, function(res){
					if(res.success){
						$("#choc-uo-create").val("");
						Choc.poptime("Nuova UO creata!");
						Choc._setupChart(res.newuo);
						Choc.Picker.code.destroy();
					}
				});
			}
		});
		
	},
	// remove uo and redraw
	_removeUO: function(e){
		e.stopPropagation();
		Choc.confirm({
			message: "Vuoi davvero eliminare l'UO?",
			approve: function(){
				Choc.Org.removeUo(Choc._currentUO, function(res){
					if(res.success){
						Choc.poptime("UO eliminata!");
						Choc._setupChart($(".orgChart .level0").data("noderef"));
					} else {
						Choc.alert(res.message, "warning");
					}
				});
			}
		})
	},
	// remove uo and redraw
	_renameUO: function(){
		var html = "<div class='ui labeled fluid input'><div class='ui label'>Nuovo nome UO</div>";
		html += "<input type='text' onkeydown='Choc.Picker.code.go(event);' id='org-uo-rename-value' ";
		html += "value='"+Choc.Org.getUo(Choc._currentUO).name+"'></div>";
		Choc.Picker.putCode({
			header: "Rinomina Unità Organizzativa",
			body: html,
			gohtml: "<i class='icon font'></i>Rinomina",
			go: function(event){
				if(event!=null && event.keyCode!=13)return;
				var newname = $.trim($("#org-uo-rename-value").val());
				if(newname.length>0){
					Choc.Docs.post({
						noderef: Choc._currentUO,
						mode: "edit",
						"cm:name": newname
					}, function(res){
						if(res.success){
						    Choc.Picker.code.destroy();
							Choc.poptime("UO rinominata con successo!");
							Choc._setupChart(Choc._currentUO);
                            Choc._reloadDetailsUo();
						} else {
							Choc.alert("Impossibile rinominare l'UO!", "danger");
						}
					});
				}
			}
		});
	},
	
	_moveUO: function(e){
        Choc._isMoveActive = true;
        $("#choc-org-chart-container").addClass("org-chart-move");
        e.stopPropagation();
        Choc.poptime("Seleziona l'UO in cui vuoi spostare '" + Choc.Org.getUo(Choc._currentUO).name + "'");
	},

	_disableSingleUo: function(node, disable){
        Choc.Org.disableUo(node, disable, function(res){
            if(res.success){
                Choc._isUoDisabled=disable;
                Choc._setupChart(Choc._currentUO);
            } else {
                Choc.poptime("Errore disabilita UO!","warning");
            }
        });
	},
	_disableUORecursive: function(node, disable) {
		var currUOToDisable = Choc.Org.getUo(node);
		if (currUOToDisable.children.length > 0) {
            Choc._disableSingleUo(node, disable);
            for (var i = 0; i < currUOToDisable.children.length; i++) {
				Choc._disableUORecursive(currUOToDisable.children[i], disable);
            }
        } else {
            Choc._disableSingleUo(node, disable);
		}
	},
	
	_disableUO: function(el){
		var itemEl = $(el);
		var disable;
        disable = !Choc._isUoDisabled;

        var currUOToDisable = Choc.Org.getUo(Choc._currentUO);

		// padre disabilitato e si vuole abilitare figlio
		if (currUOToDisable.parentDisabled && !disable) {
            Choc.alert("Impossibile abilitare la UO selezionata. Abilitare prima il livello sovrastante!", "danger");
		} else {
            var msg = disable ? "Vuoi disabilitare la UO selezionata e tutte le UO sottostanti?" : "Vuoi abilitare la UO selezionata e tutte le UO sottostanti?";
            if (currUOToDisable.children.length == 0) {
                msg = disable ? "Vuoi disabilitare la UO selezionata?" : "Vuoi abilitare la UO selezionata?";
            }
            Choc.confirm({
                message: msg,
                approve: function () {
                    Choc._disableUORecursive(Choc._currentUO, disable);
                }
            });
        }

	},

	// variable for chart html
	_drawHtml: "",
	// recursive function for chart drawing
	_drawChart: function(uoref){
		var uo = Choc.Org.getUo(uoref);
        if (uo) {
            if (!uo.disabled || (uo.disabled && Choc._showDisabledUOs)) {
                var mainUo = uo.name === Choc.Org.getUo(Choc.Org.rootUo).name;
                var actionBarHtml = '<div class="ui tiny icon buttons hide">';
                actionBarHtml += '<div class="ui button details" onclick="Choc._detailsUO(event);" title="Dettagli"><i class="bars icon"></i></div>';
                actionBarHtml += '<div class="ui button" onclick="Choc._createUO(event);" title="Crea UO"><i class="plus icon"></i></div>';
                if (!mainUo) {
                    actionBarHtml += '<div class="ui button" onclick="Choc._moveUO(event);" title="Sposta"><i class="share icon"></i></div>';
                    actionBarHtml += '<div class="ui button" onclick="Choc._removeUO(event);" title="Elimina"><i class="remove icon"></i></div>';
                }
                actionBarHtml += '</div>';
                Choc._drawHtml += "<li class='chartItem' data-noderef='" + uoref + "'>" + uo.name + actionBarHtml;
                if (uo.children.length > 0) {
                    Choc._drawHtml += "<ul>";
                    for (var c in uo.children) {
                        Choc._drawChart(uo.children[c]);
                    }
                    Choc._drawHtml += "</ul>";
                }
                Choc._drawHtml += "</li>";
            }
        }
	},
	// setup chart function
	_setupChart: function(noderef){
		Choc.Org.getUos(function(res){
			var chartUl = $("#choc-org-chart");
			chartUl.empty();
			Choc._drawChart(res.root);
			chartUl.html(Choc._drawHtml);
			chartUl.orgChart({
				container : $('#choc-org-chart-container')
			});
			
			Choc._drawHtml = "";
            var uos = $("#choc-org-chart-container .orgChart div.node");
			uos.click(Choc._uoSelect);
			if(noderef!=null){
				Choc._uoSelect(noderef);
			}

            $("#choc-org-chart-container .orgChart div.node").each(function () {
				var element = $(this);
				var currRef =element.data("noderef");
				var uoCurr=res.uos[currRef];
				if(uoCurr.disabled){
					element.addClass("disabled");
				}
				
			});

			// se effettuo cambiamenti mentre è attivo il picker di dettagli, lo chiudo (ad esempio, disabilita/abilita uo)
            if (Choc.Picker.code){
                Choc.Picker.code.destroy();
            }
		});
	},
	// load uo and draw chart
	_uoSelect: function(noderef){
		// CASO SPECIALE: è attivo lo spostamento degli UO
		if(Choc._isMoveActive){
			Choc.Org.moveUo(Choc._currentUO, $(this).data("noderef"), function(res){
				if(res.success){
					Choc.alert("UO spostata con successo!");
                    Choc._isMoveActive = false;
                    $("#choc-org-chart-container").removeClass("org-chart-move");
					Choc._setupChart(Choc._currentUO);
				} else {
					Choc.alert(res.message, "danger");
				}
			});
			return;
		}
        $("#choc-org-chart-container .active").find('.ui.buttons').addClass('hide');
		$("#choc-org-chart-container .active").removeClass("active");
		if(typeof noderef == "object"){
			Choc._currentUO = $(this).data("noderef");
			$(this).addClass("active");
		} else {
			Choc._currentUO = noderef;
            $("#choc-org-chart-container .orgChart div.node").each(function () {
				var element = $(this);
				if(element.data("noderef")==noderef){
					element.addClass("active");
					return false;
				}
			});
		}
        $("#choc-org-chart-container .active").find('.ui.buttons').removeClass('hide');
		var uo = Choc.Org.getUo(Choc._currentUO);
		Choc._isUoDisabled = uo.disabled;
	},
    _exportUOs: function(){
		Choc.Org.getUos(function(res){
			var csv = "";
			var level = -1;
			var drawUo = function(ref){
				var uo = res.uos[ref];
				if(uo) {
					level++;
					var minus = "";
					for (var i = 0; i < level; i++) {
						minus += ",";
					}
					if (minus.length > 0) {
						minus += "";
					}
					if (!uo.disabled) {
						csv += minus + uo.name + "\n";
					} else {
						csv += minus + uo.name + " (disabilitata) \n";
					}
					for (var j = 0; j < uo.children.length; j++) {
						drawUo(uo.children[j]);
					}
					level--;
				}
			};
			drawUo(res.root);

			var encodedData = window.btoa(csv);

			var href = "data:application/octet-stream;charset=utf-8;base64,"+encodedData;

			var link = document.createElement("a");
			link.download = "Organigramma.csv";
			link.href = href;
			link.click();

		});
    },
    _detailsUO: function (e) {
        if(e) {
            e.stopPropagation();
        }
        Choc.Picker.codeScope = {uo: Choc.Org.getUo(Choc._currentUO)};
        Choc.Picker.putCode({
            header: Choc._render(Choc.mustache_url + "uo.details.header.ejs", {uo: Choc.Org.getUo(Choc._currentUO)}),
            template: "uo.details.ejs",
            showFooter: false,
            width: "ten"
        });
        Choc.Picker.code.picker.find(".choc-service-header").css("padding-bottom", 0);
        Choc.Picker.code.picker._selectUoDetailTab = function (el) {
            var value = $(el).data('value');
            Choc.Picker.code.picker.find(".active").removeClass("active");
            Choc.Picker.code.picker.find(".grid[id$='-section']").addClass("hide");
            Choc.Picker.code.picker.find('.item[data-value="' + value + '"]').addClass("active");
            Choc.Picker.code.picker.find('.grid[data-value="' + value + '"]').removeClass("hide");
        };

        //assign user to uo
        // search user
        Choc.Picker.code.picker._searchUsersOrg = function (event) {
            if (event != null && event.keyCode != 13) return;
            var q = $.trim($("#org-user-q").val());
            if (q == "" || q == "*") {
                Choc.poptime("Inserisci almeno un carattere!", "warning");
                $("#org-users-result").empty();
                return;
            }
            Choc.Org.searchUsers(q, false, true, 10, function (users) {
                var resultUl = $("#org-users-result");
                resultUl.empty();
                if (users.length > 0) {
                    for (var u in users) {
                        var user = users[u];
                        if (user.username != "guest") {
                            var html = "<div class='item' data-username='" + user.username + "'>", inThisUo = false, uo, uoHtml = [];
                            for (var o in user.uos) {
                                uo = user.uos[o];
                                if (Choc.Org.uos[uo.noderef]) {
                                    if (uo.site == Choc.site) {
                                        uoHtml.push("<i class='icon sitemap'></i>" + Choc.Org.getUo(uo.noderef).name);
                                        if (uo.noderef == Choc._currentUO) {
                                            inThisUo = true;
                                        }
                                    }
                                }
                            }
                            if (!inThisUo) {
                                html += "<div class='item right floated'><div onclick='Choc.Picker.code.picker._addUser(this);' class='ui label cursor pointer'>";
                                html += "<i class='icon plus'></i> Aggiungi</div></div>";
                            }
                            html += "<i class='icon user'></i><div class='content'><div class='header'>";
                            html += user.name + " " + user.surname + " (" + user.username + ")</div>";
                            if (uoHtml.length > 0) {
                                html += "<div class='description' style='color: #767676; margin-top: 2px'>" + uoHtml.join("<br>") + "</div>";
                            }
                            html += "</div></div>";
                            resultUl.append(html);
                        }
                    }
                } else {
                    resultUl.append("<div class='item'>Nessun risultato...</div>");
                }
            });
        };
        // add user to uo
        Choc.Picker.code.picker._addUser = function (li) {
            var user = $(li).parents("[data-username]").data("username");
            Choc.Org.addUserToUo(user, Choc._currentUO, function (success) {
                if (success) {
                    Choc.poptime("Utente aggiunto all'UO!");
                    Choc._reloadDetailsUo();
                } else {
                    alert("Errore imprevisto!");
                    location.reload();
                }
            });
        };
        // show user permissions
        Choc.Picker.code.picker._userPermix = function (el) {
            var username = $(el).parents("[data-username]").data("username");
            Choc.Picker.putCode({
                header: "",
                body: "<div id='org-uo-user-perms'></div>",
                go: function () {
                    Choc.Picker.code.destroy();
                },
                gohtml: "Chiudi"
            });

        };
        Choc.Picker.code.picker._electLeader = function (el) {
            var username = $(el).parents("[data-username]").data("username");
            Choc.Docs.post({
                    "org:nodeUoLeader": username,
                    "mode": "edit",
                    "noderef": Choc._currentUO,
                    "type": "org:nodeUo"
                },
                function (res) {
                    if (res.success) {
                        Choc.poptime("Reponsabile assegnato con successo");
                    }
                    else {
                        Choc.poptime("Errore nell'assegnazione del responsabile", "warning");
                    }
                    Choc._reloadDetailsUo();
                }
            );
        };
        Choc.Picker.code.picker._removeLeader = function () {
            Choc.Docs.post({
                    "org:nodeUoLeader": "",
                    "mode": "edit",
                    "noderef": Choc._currentUO,
                    "type": "org:nodeUo"
                },
                function (res) {
                    if (res.success) {
                        Choc.poptime("Reponsabile rimosso con successo");
                    }
                    else {
                        Choc.poptime("Errore nella rimozione del responsabile", "warning");
                    }
                    Choc._reloadDetailsUo();
                }
            );
        };
        Choc.Picker.code.picker._removeUser = function (el, isLeader) {
            Choc.confirm({
                message: "Vuoi davvero rimuovere l'utente dall'UO? L'utente non avrà più accesso all'AOO!",
                approve: function () {
                    if (isLeader) {
                        Choc.Docs.post({
                                "org:nodeUoLeader": "",
                                "mode": "edit",
                                "noderef": Choc._currentUO,
                                "type": "org:nodeUo"
                            },
                            function (res) {
                                if (res.success) {
                                    Choc.poptime("Responsabile rimosso con successo");
                                }
                                else {
                                    Choc.poptime("Errore nella rimozione del responsabile", "warning");
                                }
                            }
                        );
                    }
                    Choc.Org.removeUserFromUo($(el).parents("[data-username]").data("username"), Choc._currentUO, function (success) {
                        if (success) {
                            Choc.poptime("Utente rimosso con successo!");
                            Choc._reloadDetailsUo();
                        } else {
                            alert("Errore imprevisto!");
                            location.reload();
                        }
                    });
                }
            });
        };
    },
    _reloadDetailsUo: function(){
        Choc.Org.getUos(function () {
            var tabSelected = null;
            if (Choc.Picker.code) {
                tabSelected = $(".choc-service .choc-service-uo-details .item.active").data("value");
                Choc.Picker.code.destroy();
            }
            Choc._detailsUO();
            if(tabSelected){
                $(".choc-service .choc-service-uo-details .item[data-value='"+tabSelected+"']").click();
            }
        });
    },
    _toogleDisabledUos: function(){
        Choc._showDisabledUOs = !Choc._showDisabledUOs;
        Choc._setupChart(null);
        var actionsToolbar = $('#org-actions-toolbar');
        if (Choc._showDisabledUOs){
            actionsToolbar.find('.disableUos').removeClass('hide');
            actionsToolbar.find('.enableUos').addClass('hide');
        } else {
            actionsToolbar.find('.disableUos').addClass('hide');
            actionsToolbar.find('.enableUos').removeClass('hide');
        }
    }
});
	
})();
