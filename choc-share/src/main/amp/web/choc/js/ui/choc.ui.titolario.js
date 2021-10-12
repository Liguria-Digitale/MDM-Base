/**
 * Choc @UI Module
 * @namespace Choc
*/

(function(){
$(document).ready(function() {
	Choc.Docs.getPreferences(Choc._updatePreferencesVariables);
});
/**
 * @UI module (appending to Choc general object)
 */
$.extend(Choc, {

    _canCreateNewFascicolo: false,
    _canCreateNewFolder: false,

	_titPaging: new Choc.Pagination({
			    	container: "#tit-pagination2 .pager",
			    	every: function(){
					Choc.Docs.currentPage = this.page;
					this.elements = 50;
					Choc.Docs.children(Choc.Docs.currentParent, Choc._renderDoclib);
				}
			}),
	// function to render row of doclib
	_renderRow: function(node, search){
		var type = "content";
		var indicators = [];
		if(node.type=="tit:titolo"){
			type="titolo";
		} else if(node.type=="tit:classe"){
			type="classe";
		} else if(node.type=="tit:fascicolo"){
			type="fascicolo";
		} else if(node.type=="cm:folder"){
			type="folder";
		}
		var clickFn = search ? "_searchSelect" : "_doclibNext";
		var html = "<div class='item type-"+type+"' data-noderef='"+node.nodeRef+"' onclick='Choc."+clickFn+"(this, event);' tabindex='0'>", icon = "";
		if(type=="content"){
			icon = Choc.Docs.icon(node.properties["cm:name"]);
			if(!search) {
				// disabilito multiple actions durante la ricerca
				indicators.push("<div class='ui checkbox left floated'><input type='checkbox' aria-label='Seleziona'/><label><span class='hide'>Seleziona</span></label></div>");
			}
			if(node.aspects.indexOf("sign:marked")>-1){
				indicators.push("<i title='Marcato' class='icon legal right floated'></i>");
				indicators.push("<i title='Firmato' class='icon pencil right floated'></i>");
			} else if(node.aspects.indexOf("sign:signed")>-1){
				indicators.push("<i title='Firmato' class='icon pencil right floated'></i>");
			}
            if(node.aspects.indexOf("sign:encrypted")>-1){
                indicators.push("<i title='Criptato' class='icon key right floated'></i>");
            }
			if(node.aspects.indexOf("cm:workingcopy")>-1){
				indicators.push("<i title='Bloccato' class='icon lock right floated'></i>");
			}
		}else {
			if(type=="fascicolo"){
				icon = "<i class='brown icon folder open'></i>";
				// calcolo numero fascicolo
				var fascNumber = Choc._fascicoloNumber(node);
				if(fascNumber) {
                    indicators.push("<span class='ui small label right floated'>" + fascNumber + "</span>");
                }
				if(node.properties["tit:fascicoloStato"]=="chiuso"){
                    indicators.push("<i title='Chiuso' class='icon lock right floated'></i>");
				}
			} else if(type=="classe"){
				icon = "<i class='olive icon folder open'></i>";
			} else if(type=="titolo"){
				icon = "<i class='teal icon folder open'></i>";
			} else {
				icon = "<i class='black icon folder open'></i>";
			}
		}
		// add external indicators
		for(var i in Choc.indicators){
			if(node.type==i || $.inArray(i, node.aspects)>-1){
				indicators.push(Choc.indicators[i](node));
			}
		}
		html += indicators.join("");
		html += icon;
		html += "<div class='content'>";
		if(type=="titolo"){
			var roman = node.properties["tit:titoloNumeroRomano"];
			html += roman ? roman+" - " : "";
		} else if(type=="classe"){
			html += node.properties["tit:baseFolderNumber"] ? node.properties["tit:baseFolderNumber"]+" - " : "";
		}
		html += node.properties["cm:name"]+"</div>";
		html += "</div>";
		return html;
	},
	// function to render actions
	_renderActions: function(node){
		$("#tit-actions > button").addClass("hide");
		var fascicoloChiuso = false, writePermission = Choc.Docs.haveWritePermission(node), managePermission = Choc.Docs.haveManagePermission(node);
		if(node.parent!=null){
			var parent = Choc.Docs.docs[node.parent];
			if(parent.type=="tit:fascicolo" && parent.properties["tit:fascicoloStato"]=="chiuso"){
				fascicoloChiuso = true;
			}
		}
		var showActs = [];
		switch(node.type){
		case "cm:content":
			showActs.push("download");
			showActs.push("preview");
			if(managePermission){
				if(!fascicoloChiuso){
					if(node.aspects.indexOf("cm:lockable")==-1) {
						showActs.push("rename");
					}
				}
				if(!fascicoloChiuso && node.aspects.indexOf("cm:lockable")==-1){
					showActs.push("meta");
				}
			}			
			if(writePermission){
				showActs.push("startwf");
				if(!fascicoloChiuso){
					if(node.aspects.indexOf("cm:lockable")==-1) {
						if (node.mimetype == Choc.mime.JPG || node.mimetype == Choc.mime.PNG || node.mimetype == Choc.mime.TIF) {
							showActs.push("ocr");
						}
						if (node.aspects.indexOf("sign:ispdfa") == -1) {
							showActs.push("topdfa");
						}
                        // add check to "sign:signed" aspect to avoid multisign on same file
						if (node.aspects.indexOf("sign:marked") == -1) {
							showActs.push("sign");
							showActs.push("mark");
						}
						showActs.push("rename");
						showActs.push("move");
						showActs.push("delete");
						if (node.mimetype == Choc.mime.TXT || node.mimetype == Choc.mime.HTML || node.mimetype == Choc.mime.XML) {
							showActs.push("editdoc");
						}
						if (node.mimetype == Choc.mime.DOC || node.mimetype == Choc.mime.DOCX || 
								node.mimetype == Choc.mime.PPT || node.mimetype == Choc.mime.PPTX ||
								node.mimetype == Choc.mime.XLS || node.mimetype == Choc.mime.XSLX) {
							showActs.push("aos");
						}
						showActs.push("checkout");
					} else {
						showActs.push("checkoutcanc");
					}
					showActs.push("newversion");
                    if(Choc.Docs.mode=="doclib"){
                        showActs.push("perms");
                    }
				}
				if(!fascicoloChiuso && node.aspects.indexOf("cm:lockable")==-1){
					showActs.push("meta");
				}
			}
			if(!fascicoloChiuso){
				showActs.push("copy");
				if(managePermission){
					showActs.push("move");
				}
			}
			break;
		case "cm:folder":
			showActs.push("downloadzip");
		    if (writePermission || managePermission) {
                showActs.push("upload");
                showActs.push("newfolder");
                showActs.push("newdoc");
                showActs.push("bulkimport");
                showActs.push("signall");
                if (node.aspects.indexOf("st:siteContainer") == -1) {
                    showActs.push("modify");
                    if (writePermission) {
                        showActs.push("move");
                        showActs.push("perms");
                        showActs.push("delete");
                    }
                }
            }
			break;
		case "tit:baseFolder":
			if(writePermission){
                if (Choc._canCreateNewFolder){
                    showActs.push("newfolder");
                }
				showActs.push("newtitolo");
				showActs.push("importtit");
				showActs.push("perms");
			}
			break;
		case "tit:titolo":
			if(writePermission){
                if (Choc._canCreateNewFascicolo){
                    showActs.push("newfascic");
                }
                if (Choc._canCreateNewFolder){
                    showActs.push("newfolder");
                }
				showActs.push("newclasse");
				showActs.push("perms");
				showActs.push("modify");
				showActs.push("historify");
				showActs.push("delete");
			}
			break;
		case "tit:classe":
			if(writePermission){
                if (Choc._canCreateNewFolder){
                    showActs.push("newfolder");
                }
				showActs.push("newfascic");				
				showActs.push("newclasse");
				showActs.push("perms");
				showActs.push("modify");
				showActs.push("historify");
				showActs.push("delete");
			} else if(managePermission){
				showActs.push("newfascic");
                if (Choc._canCreateNewFolder){
                    showActs.push("newfolder");
                }
            }
			break;
		case "tit:fascicolo":
			showActs.push("downloadzip");
			if(writePermission){
                showActs.push("perms");
				if(node.properties["tit:fascicoloStato"]=="aperto"){
                    if (Choc._canCreateNewFolder){
                        showActs.push("newfolder");
                    }
					showActs.push("upload");
					showActs.push("newdoc");
					showActs.push("modify");
					showActs.push("historify");
					showActs.push("delete");
					showActs.push("bulkimport");
					showActs.push("signall");
					showActs.push("newfascic");				
					showActs.push("closefasc");
				} else {
					showActs.push("openfasc");
				}
			}else if(managePermission){
                if(node.properties["tit:fascicoloStato"]=="aperto"){
                    if (Choc._canCreateNewFolder){
                        showActs.push("newfolder");
                    }
					showActs.push("upload");
					showActs.push("newdoc");
					showActs.push("modify");
					showActs.push("bulkimport");
					showActs.push("newfascic");				
					showActs.push("closefasc");
				} else {
					showActs.push("openfasc");
				}
			}
			break;
		default:
			if (!node.isContainer){
				if (node.size){
					showActs.push("download");
					showActs.push("preview");
				}
				if(managePermission){
					if(!fascicoloChiuso){
						if(node.aspects.indexOf("cm:lockable")==-1) {
							showActs.push("rename");
						}
					}
					if(!fascicoloChiuso && node.aspects.indexOf("cm:lockable")==-1){
						showActs.push("meta");
					}
				}			
				if(writePermission){
					//showActs.push("startwf");
					if(Choc.Docs.mode=="doclib"){
						showActs.push("perms");
					}
					if(!fascicoloChiuso){
						if(node.aspects.indexOf("cm:lockable")==-1) {
							if (node.size){
								if (node.mimetype == Choc.mime.JPG || node.mimetype == Choc.mime.PNG || node.mimetype == Choc.mime.TIF) {
									showActs.push("ocr");
								}
								if (node.aspects.indexOf("sign:ispdfa") == -1) {
									showActs.push("topdfa");
								}
			                    // add check to "sign:signed" aspect to avoid multisign on same file
								if (node.aspects.indexOf("sign:marked") == -1) {
									showActs.push("sign");
									showActs.push("mark");
								}
							}
							showActs.push("rename");
							showActs.push("move");
							showActs.push("delete");
							if (node.size){
								if (node.mimetype == Choc.mime.TXT || node.mimetype == Choc.mime.HTML || node.mimetype == Choc.mime.XML) {
									showActs.push("editdoc");
								}
								if (node.mimetype == Choc.mime.DOC || node.mimetype == Choc.mime.DOCX || 
										node.mimetype == Choc.mime.PPT || node.mimetype == Choc.mime.PPTX ||
										node.mimetype == Choc.mime.XLS || node.mimetype == Choc.mime.XSLX) {
									showActs.push("aos");
								}
								showActs.push("checkout");
							}
						} else {
							if (node.size){
								showActs.push("checkoutcanc");
							}
						}
						if (node.size){
							showActs.push("newversion");
						}
					}
					if(!fascicoloChiuso && node.aspects.indexOf("cm:lockable")==-1){
						showActs.push("meta");
					}
				}
				if(!fascicoloChiuso && node.aspects.indexOf("cm:lockable")==-1){
					showActs.push("copy");
					if(managePermission){
						showActs.push("move");
					}
				}
			}
			break;
		}
		for(var a in showActs){
			$("button.tit-action-"+showActs[a]).removeClass("hide");
		}
		if($("#tit-breadcrumb").hasClass("hide")){
			$("button.tit-action-gotonode").removeClass("hide");
		}
	},
	// function to render detail
	_renderDetail: function(node){
		var details = $("#tit-details");
		details.prev().text("Dettagli di \""+node.properties["cm:name"]+"\"");
		details.empty();
		switch(node.type){
		case "tit:titolo":
			details.append("<div class='item'>Livello titolario: <strong>Titolo</strong></div>");
			details.append("<div class='item'>Numero: <strong>"+node.properties["tit:baseFolderNumber"]+"</strong></div>");
			break;
		case "tit:classe":
			details.append("<div class='item'>Livello titolario: <strong>Classe</strong></div>");
			details.append("<div class='item'>Numero: <strong>"+node.properties["tit:baseFolderNumber"]+"</strong></div>");
			break;
		case "tit:fascicolo":
			details.append("<div class='item'>Livello titolario: <strong>Fascicolo</strong></div>");
            if (node.properties["tit:baseFolderNumber"]) {
                details.append("<div class='item'>Numero: <strong>" + node.properties["tit:baseFolderNumber"] + "</strong></div>");
                details.append("<div class='item'>Collocazione: <strong>" + Choc._fascicoloNumber(node, true) + "</strong></div>");
            }
			details.append("<div class='item'>Stato: <strong>"+node.properties["tit:fascicoloStato"]+"</strong></div>");
			if(node.properties["tit:fascicoloStato"]=="chiuso"){
				details.append("<div class='item'>Fascicolo chiuso il "+Choc.formatIsoDate(node.properties["tit:fascicoloDataChiusura"])+"</div>");
			}
			break;
		case "cm:content":
            if(node.aspects.indexOf("sign:encrypted")>-1){
                details.append("<div class='item'><i class='icon key'></i> Documento criptato</div>");
            }
			if(node.aspects.indexOf("sign:ispdfa")>-1){
				details.append("<div class='item'><i class='icon file pdf outline'></i> Documento <strong>PDF/A</strong> compliant</div>");
			}
			if(node.aspects.indexOf("sign:signed")>-1 || node.aspects.indexOf("sign:marked")>-1){
				details.append("<div class='item'><i class='icon pencil'></i>Documento <strong>firmato</strong> digitalmente</div>");
			}
			if(node.aspects.indexOf("sign:marked")>-1){
				details.append("<div class='item'><i class='icon legal'></i>Il documento ha apposta una <strong>marca temporale</strong></div>");
			}
			if(node.aspects.indexOf("cm:workingcopy")>-1){
				var wcUser = node.properties["cm:workingCopyOwner"];
				wcUser = wcUser ? wcUser.displayName : "-";
				details.append("<div class='item'><i class='icon lock'></i>Documento bloccato da <b>"+wcUser+"</b> per la modifica offline</div>");
			}
			for(var a in node.aspects){
				var aspect = node.aspects[a];
				if(Choc.types[aspect]!=null && Choc.types[aspect].isDoc){
					details.append("<div class='item'> Tipo documento: <strong>"+Choc.types[aspect].name+"</strong></div>");
					if(node.properties["doc:id"]){
						details.append("<div class='item'><i class='icon university'></i>ID documento: <strong>"+node.properties["doc:id"]+"</strong></div>");
					}
					break;
				}
			}
			details.append("<div class='item'>Dimensione: "+Choc.bytesToSize(node.size)+"</div>");
			break;
		default:
			if (!node.isContainer){
				if(node.aspects.indexOf("sign:ispdfa")>-1){
					details.append("<div class='item'><i class='icon file pdf outline'></i> Documento <strong>PDF/A</strong> compliant</div>");
				}
				if(node.aspects.indexOf("sign:signed")>-1 || node.aspects.indexOf("sign:marked")>-1){
					details.append("<div class='item'><i class='icon pencil'></i>Documento <strong>firmato</strong> digitalmente</div>");
				}
				if(node.aspects.indexOf("sign:marked")>-1){
					details.append("<div class='item'><i class='icon legal'></i>Il documento ha apposta una <strong>marca temporale</strong></div>");
				}
				if(node.aspects.indexOf("cm:workingcopy")>-1){
					var wcUser = node.properties["cm:workingCopyOwner"];
					wcUser = wcUser ? wcUser.displayName : "-";
					details.append("<div class='item'><i class='icon lock'></i>Documento bloccato da <b>"+wcUser+"</b> per la modifica offline</div>");
				}
				if(Choc.types[node.type]){
					details.append("<div class='item'> Tipo documento: <strong>"+Choc.types[node.type].name+"</strong></div>");
				}
				else{
					for(var a in node.aspects){
						var aspect = node.aspects[a];
						if(Choc.types[aspect]!=null && Choc.types[aspect].isDoc){
							details.append("<div class='item'> Tipo documento: <strong>"+Choc.types[aspect].name+"</strong></div>");
							if(node.properties["doc:id"]){
								details.append("<div class='item'><i class='icon university'></i>ID documento: <strong>"+node.properties["doc:id"]+"</strong></div>");
							}
							break;
						}
					}
				}
				if (node.size){
					details.append("<div class='item'>Dimensione: "+Choc.bytesToSize(node.size)+"</div>");
				}
			}
			break;
		}
		// aggiungo dei metadati custom grazie al punto di estensione "Choc.meta"
		for(var m in Choc.meta){
			if($.inArray(m, node.aspects)>-1){
				details.append(Choc.meta[m](node));
			}
			else if(m == node.type){
				details.append(Choc.meta[m](node));
			}
		}
		// aggiungo percorso del file
		if($("#tit-breadcrumb").hasClass("hide")){
			details.append("<div class='item'>Percorso: <i>"+node.path+"</i></div>");
		}
		// aggiungo data creazione e creatore
		li = "<div class='item'>";
		li += "Creato il "+Choc.formatIsoDate(node.properties["cm:created"])+" da "+node.properties["cm:creator"].displayName;
		li += "</div>";
		details.append(li);
		// aggiungo data ultima modifica e modificatore
		li = "<div class='item'>";
		li += "Modificato il "+Choc.formatIsoDate(node.properties["cm:modified"])+" da "+node.properties["cm:modifier"].displayName;
		li += "</div>";
        details.append(li);
		// aggiungo id
		li = "<div class='item'>System id: "+node.nodeRef.split("/").pop();
		if(!node.isContainer){
			li += " <a onclick='Choc._copyLink()' class='ui small label' style='padding: 0.4em 0.6em'>Copia link</a>";
		}
		li += "</div>";
		details.append(li);
		// aggiungo informazioni sul versioning se ci sono
		if(node.type=="cm:content" && node.aspects.indexOf("cm:versionable") >= 0){
			details.append("<div class='ui header' id='tit-details-versions'>Versioni</div>");
			Choc.Docs.versions(node.nodeRef, function(versions){
				var html = "", actions = false;
				for(var v in versions){
					var version = versions[v], vuser = $.trim(version.creator.firstName+" "+version.creator.lastName);
					if(!Choc.Docs.docs[version.nodeRef]){
						Choc.Docs.docs[version.nodeRef] = {properties: { "cm:name": version.name }}
					}
					html += "<div class='item' data-version='"+version.label+"'><div class='right floated'>";
					if(actions){
						html += "<div class='ui mini icon button' onclick='Choc._revertNode(this);' title='Ripristina'><i class='icon exchange'></i></div>";
						html += "<div class='ui mini icon button' onclick='Choc.Picker.showPreview({noderef:\""+version.nodeRef+"\"});' title='Anteprima'><i class='icon eye'></i></div>";
						html += "<div class='ui mini icon button' onclick='Choc.Actions.runAction(\"download\", version.nodeRef);' title='Download'><i class='icon download'></i></div>";
					} else {
						actions = true;
					}
					html += "</div><div class='ui label left floated'>"+version.label+"</div>";
					html += "<div class='content'><div class='description'>Da "+vuser+" il "+Choc.formatIsoDate({iso8601:version.createdDateISO})+"</div>";
					if(version.description){
						html += "<div class='description'><i>"+version.description+"</i></div>";
					}
					html += "</div></div>";
				}
				$("#tit-details-versions").after(html);
			});
		}
	},
	
	_updatePreferencesVariables: function(pref){
		 if(pref.mdm && pref.mdm.fascicoli){
			if(pref.mdm.fascicoli.sortField)
				Choc.Docs.titSortField = pref.mdm.fascicoli.sortField;
			if(pref.mdm.fascicoli.sortDesc)
				Choc.Docs.titSortDesc = pref.mdm.fascicoli.sortDesc;
		}	
	},

	_updateFascicoliPreferences: function(property, value){
		if(property=="sortField"){
			Choc.Docs.setPreferences({mdm:{fascicoli:{sortField:value}}}, Choc._updateDocLib);
		}
		if(property=="sortDesc"){
			if(Choc.Docs.titSortDesc=="false"){
				Choc.Docs.setPreferences({mdm:{fascicoli:{sortDesc:"true"}}}, Choc._updateDocLib);
			}
			else{
				Choc.Docs.setPreferences({mdm:{fascicoli:{sortDesc:"false"}}}, Choc._updateDocLib);
			}
		}		
	},
	
	_updateDocLib: function(success, pref){
		if(success){
            Choc.poptime("Preferenze aggiornate");
            Choc._updatePreferencesVariables(pref);
    		Choc.Docs.children(Choc.Docs.currentParent, Choc._renderDoclib);
		}else{
            Choc.poptime("Impossibile aggiornare le preferenze!", "danger");
		}
			
	},
	
	// function to setup doclib
	_renderDoclib: function(nodes, totalElements){
		var dl = $("#tit-doclib");		
		dl.empty();
		var parent = Choc.Docs.docs[Choc.Docs.currentParent];
		if(parent.type=="tit:classe" || parent.type=="tit:fascicolo" || parent.type=="cm:folder"){
			var sortDescClass = "";
			if(Choc.Docs.titSortDesc=="false"){
				sortDescClass = "ascending";
			}else{
				sortDescClass = "descending";
			}
			
			var sortFieldValue = Choc.Docs.titSortField;
			var sortFieldName = "Nome";
			var selectAllLink = "";
			if (parent.type == "tit:fascicolo" || parent.type == "cm:folder") {
				selectAllLink = "<i class='check square outline icon' onclick='Choc._selectAllTit();'></i> ";
			} 
			
			if(sortFieldValue=="cm:created"){sortFieldName = "Data";}
			if(sortFieldValue=="cm:name"){sortFieldName = "Nome";}
			if(sortFieldValue=="tit:baseFolderNumber"){sortFieldName = "Numero";}
			dl.append("<div class='item active ui header'>" +
							"<div class='left floated'>" + selectAllLink +"Sei in \""+parent.properties["cm:name"]+"\":</div>" +
							"<div class='right floated button cursor pointer' onclick='Choc._updateFascicoliPreferences(\"sortDesc\")' title=" + sortDescClass +" tabindex='0'><i class='sort content "+sortDescClass+" icon'></i></div>" +
							//dropdown selection order
							"<div class='ui dropdown titorderby right floated' style='margin-left: 5px;'>" +
            				"<input type='hidden' name='sortField'>" +
								"<div class='default text'>"+sortFieldName+"</div>" +
								"<i class='dropdown icon'></i>" +
								"<div class='menu'>" +
								"	<div class='item' data-value='cm:name'>Nome</div>" +
								"	<div class='item' data-value='cm:created'>Data</div>" +
								"	<div class='item' data-value='tit:baseFolderNumber'>Numero</div>" +
								"</div>" +
							"</div>"+
            				"<div class='default text right floated'>Ordina per</div>"+
						"</div>");
			$('.ui.dropdown.titorderby').dropdown({
			    onChange: function(value, text, $selectedItem) {
			    	Choc._updateFascicoliPreferences("sortField", value);
			    }
			  })
			;
		}else{
			dl.append("<div class='item active ui header'>" +
					"Sei in \""+parent.properties["cm:name"]+"\":</div>");
		}
		if($.isEmptyObject(nodes)){
			dl.append("<div class='item'>Vuoto...</div>");
		} else {
			for(var n in nodes){
				nochild = false;
				var node = nodes[n];
				if(node.aspects.indexOf("sys:hidden")==-1 && node.aspects.indexOf("cm:checkedOut")==-1){
					dl.append(Choc._renderRow(node, false));
				}
			}
			dl.find(".ui.checkbox").checkbox({
				onChange: Choc._rowSelect
			});
		}
		Choc._titPaging.total = totalElements;
		Choc._titPaging.elements = 50;
		Choc._titPaging.update();

		// set current page on pagination menu
		$("#tit-pagination").removeClass("hide");
		$("#tit-search-pagination").addClass("hide");
		$("#tit-doclib-page").text("Pag. "+(Choc.Docs.currentPage+1));
		// reset multiple selection
		Choc._rowSelect();
	},
	// function to add a level to breadcrump
	_addBread: function(node){
		var bc = $("#tit-breadcrumb"),
			type = "content", icon = "folder open", color = "black";
		if(node.type=="tit:titolo"){
			type = "titolo";
			color = "teal";
		} else if(node.type=="tit:classe"){
			type = "classe";
			color = "olive";
		} else if(node.type=="tit:fascicolo"){
			type = "fascicolo";
			color = "brown";
		} else if(node.type=="cm:folder"){
			type = "folder";
		} else if(node.type=="tit:baseFolder"){
			type = "folder";
			icon = "archive";
		}
		var html = "<a class='section type-"+type+"' data-model='"+node.type+"' data-noderef='"+node.nodeRef+"' onclick='Choc._breadNext(this);'>";
		html += "<div class='ui basic "+color+" small button'><i class='icon "+icon+"'></i>"+node.properties["cm:name"]+"</div><i class='right chevron icon divider'></i></a>";
		bc.append(html);
	},
	// function to select current parent
	_selectParent: function(noderef){
		Choc.Docs.currentParent = noderef;
		if(noderef) {
			$("#tit-advsearch-q").prop("placeholder", "Cerca in " + Choc.Docs.docs[noderef].properties["cm:name"] + "...");
		}
	},
	// function for click on doclib row
	_doclibNext: function(li, event){
		if(event && $(event.target).is("label")){
			return;
		}
		li = $(li);
		var node = Choc.Docs.docs[li.data("noderef")];
		if(node.isContainer){
			Choc._selectParent(node.nodeRef);
			Choc.Docs.currentDoc = null;
			Choc.Docs.currentPage = 0;
			Choc._titPaging.page = 0;
			Choc._addBread(node);

			Choc.Docs.children(node.nodeRef, Choc._renderDoclib);
			Choc._renderActions(node);
			Choc._renderDetail(node);
		} else {
			if(node.nodeRef==Choc.Docs.currentDoc){
				Choc._selectCurrentParent();
			} else {
				Choc.Docs.currentDoc = node.nodeRef;
				var doclib = $("#tit-doclib .item").removeClass("active");
				li.addClass("active");
				Choc._renderActions(node);
				Choc._renderDetail(node);
			}
		}
	},
	// function for click on breadcrumb row
	_breadNext: function(li){
		li = $(li);
		var noderef = li.data("noderef");
		li.nextAll().remove();
		li.remove();
		Choc._doclibNext("<span data-noderef='"+noderef+"'></span>");
	},
	// function to restore view as current parent view
	_selectCurrentParent: function(){
		Choc.Docs.currentDoc = null;
		var parent = Choc.Docs.docs[Choc.Docs.currentParent];
		$("#tit-doclib > .item").removeClass("active");
		$("#tit-doclib > .header").addClass("active");
		Choc._renderActions(parent);
		Choc._renderDetail(parent);
	},
	// function for multi select row
	_rowSelect: function(){
		Choc.Docs.multipleSelection = [];
		var rows = $("#tit-doclib input[type='checkbox']:checked");
		if(rows.length > 0){
			var writePerms = true;
			rows.each(function(){
				var noderef = $(this).parents("[data-noderef]").data("noderef"), node = Choc.Docs.docs[noderef], parent = Choc.Docs.docs[node.parent];
				Choc.Docs.multipleSelection.push(noderef);
				writePerms = writePerms && Choc.Docs.haveWritePermission(node);
				if(parent.type=="tit:fascicolo" && parent.properties["tit:fascicoloStato"]=="chiuso"){
					writePerms = false;
				}
			});
			if(!writePerms){
				$("#tit-multiple-actions .need-write").addClass("hide");
			} else {
				$("#tit-multiple-actions .need-write").removeClass("hide");
			}
			$("#tit-multiple-actions").removeClass("hide");
		} else {
			$("#tit-multiple-actions").addClass("hide");
		}
	},
	_deselectRow: function(){
		$("#tit-doclib .ui.checkbox").checkbox("uncheck");
		Choc._rowSelect();
	},
	// function to change fascicolo state
	_fascState: function(){
		Choc.Docs.Actions.changeFascicoloState(Choc.Docs.currentParent, function(res){
			if(res.success){
				Choc.poptime("Fascicolo "+res.state.toLowerCase());
				$("#tit-breadcrumb a").last().click();
			}
		});
	},
	// function to go in specified node
	_gotoNode: function(noderef){
		if(noderef==null){
			noderef = Choc.Docs.currentDoc || Choc.Docs.currentParent;
			Choc._resetSearch(true);
		}
		// reset current page of doclib pagination
		Choc.Docs.currentPage = 0;
		Choc._titPaging.page = 0;
		var tree = [];
		var seeTree = function(ref){
			var seeTreeInternal = function(node){
				tree.push(node.nodeRef);
				if(node.aspects.indexOf("st:siteContainer")==-1){
					seeTree(node.parent);
				} else {
					// draw
					$("#tit-breadcrumb").empty();
					while(tree.length>0){
						var treeNode = Choc.Docs.docs[tree.pop()];
						var lastParent = treeNode.parent;
						// se è una cartella la aggiungo al bread
						if(treeNode.isContainer){
							Choc._addBread(treeNode);
							// se l'ultimo nodo del tree è una cartella ci clicco
							if(tree.length==0){
								Choc.Docs.currentParent = treeNode.nodeRef;
								$("#tit-breadcrumb a[data-noderef='"+treeNode.nodeRef+"']").click();
							}
						} else {
							// se è un documento vuol dire che sto all'ultimo nodo, e ci clicco
							Choc.Docs.currentParent = lastParent;
							Choc.Docs.currentDoc = null;
							Choc.Docs.children(lastParent, function(nodes){
								Choc._renderDoclib(nodes);
								var leafNode = $("div[data-noderef='"+treeNode.nodeRef+"']");
								if(leafNode.length>0){
									leafNode.click();
								} else {
									Choc._selectCurrentParent();
								}
							});
						}
					}
				}
			}
			Choc.Docs.get(ref, function(item){
				if(Choc.Docs.mode=="doclib" && !item.isContainer){
					var parent = Choc.Docs.docs[item.nodeRef];
					if(parent==null || parent.type.indexOf("tit:")==-1){
						Choc.Docs.parents(item.nodeRef, function(parents){
							for(var p in parents){
								var par = parents[p];
								if(par.type.indexOf("tit:")>-1){
									item.parent = par.nodeRef;
                                    break;
								}
							}
							seeTreeInternal(item);
						});
					} else {
						seeTreeInternal(item);
					}
				} else {
					seeTreeInternal(item);
				}
			});
		}
		seeTree(noderef);
	},
	// function to call when a search result clicked
	_searchSelect: function(el){
		var doclib = $("#tit-doclib .item").removeClass("active");
		var liEl = $(el);
		liEl.addClass("active");
		var noderef = liEl.data("noderef");
		var node = Choc.Docs.docs[noderef];
		if(node==null){
			Choc.Docs.get(noderef, Choc._searchSelectRender);
		} else {
			Choc._searchSelectRender(node);
		}
	},
	_searchSelectRender: function(node){
		if(node.isContainer){
			Choc._selectParent(node.nodeRef);
			Choc.Docs.currentDoc = null;
		} else {
			Choc.Docs.currentDoc = node.nodeRef;
			Choc._selectParent(node.parent || null);
		}
		Choc._renderActions(node);
		Choc._renderDetail(node);
	},
	// function to create folder
	_folderCreate: function(){
		Choc.Picker.getForm({
			type:"cm:folder",
			mode:"new",
			form:"create",
			noderef:Choc.Docs.currentParent,
			callback:function(){
				$("#tit-breadcrumb a").last().click();
			}
		});
	},
	// function to create tit folder
	_titCreate: function(type){
		var type = "tit:"+type;
		Choc.Picker.getForm({
			type:type,
			mode:"new",
			form:"create",
			noderef:Choc.Docs.currentParent,
			callback:function(){
				$("#tit-breadcrumb a").last().click();
			}
		});
	},
	// function to delete doc or generic folder
	_nodeDelete: function(){
		var noderef, isDoc;
		if(Choc.Docs.currentDoc){
			noderef = Choc.Docs.currentDoc;
			isDoc = true;
		} else {
			noderef = Choc.Docs.currentParent;
			isDoc = false;
		}
		if (!isDoc){
			Choc.confirm({
				message: "Vuoi davvero eliminare " + (isDoc ? "il documento" : "la cartella") + "?",
				approve: function () {
					Choc.Docs.Actions.deleteNode(noderef, function (res) {
						if (res) {
							Choc.poptime("Cancellazione effettuata con successo!");
							if (isDoc) {
								$("#tit-breadcrumb a").last().click();
							} else {
								$("#tit-breadcrumb a").last().prev().click();
							}
						} else {
							Choc.poptime("Errore durante la cancellazione!", "danger");
						}
					});
				}
			});
		}
		else {
			Choc.confirm({
				message: "Vuoi davvero eliminare " + (isDoc ? "il documento" : "la cartella") + "?",
				approve: function () {
					Choc.Docs.Actions.deleteNode(noderef, function (res) {
						if (res) {
							Choc.poptime("Cancellazione effettuata con successo!");
							if (isDoc) {
								$("#tit-breadcrumb a").last().click();
							} else {
								$("#tit-breadcrumb a").last().prev().click();
							}
						} else {
							Choc.poptime("Errore durante la cancellazione!", "danger");
						}
					});
				}
			});
		}
	},
	_multipleDelete: function(){
		Choc.confirm({
			message: "Vuoi davvero eliminare gli elementi selezionati?",
			approve: function(){
				var responses = 0, docsok = 0;
				for(var n in Choc.Docs.multipleSelection){
					Choc.Docs.Actions.deleteNode(Choc.Docs.multipleSelection[n], function(res){
						responses++;
						if(res){
							docsok++;
						}
						if(responses==Choc.Docs.multipleSelection.length){
							Choc.poptime("Sono stati eliminati "+docsok+" elementi su "+responses);
							$("#tit-breadcrumb a").last().click();
						}
					});
				}
			}
		});
	},
	// function to delete titolario folder
	_titDelete: function(){
		Choc.confirm({
			message: "Vuoi davvero archiviare la voce di titolario?<br/>Attenzione! Non sarà più visibile!",
			approve: function(){
				Choc.Docs.Actions.deleteTitolarioFolder(Choc.Docs.currentParent, function(res){
					if(res.success){
						Choc.poptime("Archiviazione effettuata con successo!");
						$("#tit-breadcrumb a").last().prev().click();
					} else {
						Choc.poptime("Impossibile cancellare la cartella! Controlla che sia vuota","danger");
					}
				});
			}
		});
	},
	// setup actions
	_setupActions: function(){
		// setup upload action
        var fileUpload = $('#fileupload');
        if(Choc.ie9){
            fileUpload.removeClass("hide");
            $('.tit-action-upload.file-mode').remove();
        }
        var format = (Choc.ie9) ? 'text' : 'json';
        fileUpload.fileupload({
            url: Choc.alf_url+"api/upload?format="+format,
            dataType: 'json',
            forceIframeTransport: Choc.ie9,
            submit: function(e, data){
            	if (data.files[0].size > 0){
	                data.formData = {
	                    destination: Choc.Docs.currentParent,
	                    overwrite: false
	                }
        		}
            },
            start: function(){
                Choc.poptime("Upload in corso...","info");
            },
            done: function(e, data){
                var result = data.result;
                Choc.poptime("Upload effettuato con successo");
                Choc._uploadSuccess(result);
            },
            fail: function(e, data){
            	var message = "Errore durante l'upload del file";
            	if (data.files[0].size == 0){
            		message += ", non è possibile caricare file vuoti.";
            	}
                Choc.alert(message,"danger");
            }
        });
	},
	// after upload success fn to override in customization
	_uploadSuccess: function(result){
		$("#tit-breadcrumb a").last().click();
	},
	// search full text
	_searchSubmit: function(data, event){
		if(event!=null && event.keyCode!=13) return;
		if(data==null){
			data={};
		}
        data.noaspect = "sys:hidden";
		var q = $("#tit-advsearch-q").val();
		if(q){
			data.term = q;
		}
		var type = $("#tit-advsearch .ui.dropdown").dropdown("get value");
		if(type){
			data.type = type;
			if(type=="tit:fascicolo"){
				data.orderby = "cm:name";
				data.orderdesc = false;
				// se annuale non è spuntato, rimuovo "false"
				if(data.tit_fascicoloAnnuale==false){
					delete data.tit_fascicoloAnnuale;
				}
			}
		}
		Choc._startSearchMode();
		Choc.Docs.search(data, Choc._drawSearchResults);
	},
	// draw result search (used for fts and advanced)
	_drawSearchResults: function(nodes){
		$("#tit-pagination2").addClass("hide");
		var ulEl = $("#tit-doclib");
		if($.isEmptyObject(nodes)){
			if (Choc.Docs.currentSearchPage > 0){
				Choc.Docs.currentSearchPage--;
			}
			else{
				ulEl.empty();
				ulEl.append("<div class='item active ui header'>Risultati della ricerca:</div>");
				ulEl.append("<div class='item'>Nessun risultato...</div>");
				$("#tit-search-pagination").addClass("hide");
			}
		} else {
			ulEl.empty();
			ulEl.append("<div class='item active ui header'>Risultati della ricerca:</div>");
			for(var i in nodes){
				var item = nodes[i];
				ulEl.append(Choc._renderRow(item, true));
			}
			$("#tit-search-pagination").removeClass("hide");
			$("#titsearch-doclib-page").text("Pag. "+(Choc.Docs.currentSearchPage+1));
		}
	},
	// start search mode
	_startSearchMode: function(){
		// clean div page
		$("#tit-breadcrumb").addClass("hide");
		$("#tit-breadcrumb").empty();
		var details = $("#tit-details");
		details.prev().text("Dettagli");
		details.empty();
		$("#tit-actions > button").addClass("hide");
		$("#tit-doclib-page").addClass("hide");
	},
	// reset search
	_resetSearch: function(nogo){
		$('#tit-advsearch-q').val('');
		$("#tit-breadcrumb").removeClass("hide");
		$("#tit-doclib-page").removeClass("hide");
		$("#tit-advsearch .ui.dropdown").dropdown("set selected", "");
		if(!nogo){
			Choc._gotoNode(Choc.Docs.currentParent);
		}
	},
	// rename node
	_renameNode: function () {
        Choc.Picker.getForm({
            type: "cm:content",
            mode: "edit",
            form: "edit",
            noderef: Choc.Docs.currentDoc,
            callback: function(){
                $("#tit-breadcrumb a").last().click();
            }
        });
    },
	// function to modify folder name and meta
	_editNode: function(){
		var node = Choc.Docs.docs[Choc.Docs.currentDoc || Choc.Docs.currentParent],
			type = Choc.types[node.type];
		Choc.Picker.getForm({
			type: type==null ? "cm:content" : node.type,
			mode: "edit",
			form: "edit",
			noderef: node.nodeRef,
			callback: function(ref, data){
				if(!node.isContainer){
					$("#tit-breadcrumb a").last().click();
				} else {
                    if(Choc.Docs.mode=="doclib"){
                        Choc.insertAudit({
                            type: Choc.auditsConst.tit,
                            action: "Modifica voce di titolario",
                            noderef: ref,
                            params: {
                                "Tipo Voce": data.type.split(":")[1],
                                "Nuovo nome": data.cm_name,
                                "Numero": data.tit_baseFolderNumber
                            }
                        });
                    }
                    $("#tit-breadcrumb a").last().click();
				}
			}
		});
	},
	// show preview of a doc
	_showDoc: function(){
		Choc.Picker.showPreview({
			noderef: Choc.Docs.currentDoc
		});
	},
	// convert to pdf with pcr
	_makeOcr: function(){
		Choc.poptime("Estrazione testo in corso...","info");
		Choc.Docs.Actions.ocr(Choc.Docs.currentDoc, Choc.Docs.currentParent, function(res){
			$("#tit-breadcrumb a").last().click();
			if(res.success){
				Choc.poptime("File convertito in PDF (con OCR)!");
			} else {
				Choc.alert("Impossibile eseguire l'OCR su questo file", "warning");
			}
		});
	},
	// copy node
	_copyNode: function(){
		Choc._copyInternal([Choc.Docs.currentDoc]);
	},
	_multipleCopy: function(){
		Choc._copyInternal(Choc.Docs.multipleSelection);
	},
	_copyInternal: function(docs){
		Choc.Picker.openDoclib({
			multiple: false,
			selectable: function(n){return n.permissions.user.Write && ((n.type=="tit:fascicolo" && n.properties["tit:fascicoloStato"]=="aperto") || n.type=="cm:folder")},
			upload: false,
			callback: function(nodes){
				if(nodes.length>0){
					var node = nodes[0];
					Choc.Docs.copy(docs, node.noderef, function(res){
						if(res.success){
							$("#tit-breadcrumb a").last().click();
							Choc.poptime("Documento/i copiato/i con successo!");
						} else {
							alert("Errore imprevisto!");
							location.reload();
						}
					});
				}
			}
		});
	},
	// move node
	_moveNode: function(){
		Choc._moveInternal([Choc.Docs.currentDoc]);
	},
	_multipleMove: function(){
		Choc._moveInternal(Choc.Docs.multipleSelection);
	},
	_moveInternal: function(docs){
		Choc.Picker.openDoclib({
			multiple: false,
			selectable: function(n){return n.permissions.user.Write && ((n.type=="tit:fascicolo" && n.properties["tit:fascicoloStato"]=="aperto") || n.type=="cm:folder")},
			upload: false,
			root: "doclib",
			callback: function(nodes){
				if(nodes.length>0){
					var node = nodes[0];
					Choc.Docs.move(docs, node.noderef, function(success){
						if(success){
							$("#tit-breadcrumb a").last().click();
							Choc.poptime("Documento/i spostato/i con successo!");
						} else {
							alert("Errore imprevisto!");
							location.reload();
						}
					});
				}
			}
		});
	},
	// function for create document
	_createDoc: function(){
		location.href = "editor?parent="+Choc.Docs.currentParent+"&mode="+Choc.Docs.mode;
	},
	// function for edit metadata document
	_editMeta: function(){
		var doc = Choc.Docs.docs[Choc.Docs.currentDoc],
			aspect = null;
		var typeOfDoc = doc.type;
		for(var a in doc.aspects){
			var type = Choc.types[doc.aspects[a]];
			if(type!=null && type.isDoc){
				aspect = doc.aspects[a];
				break;
			}
		}
		if(aspect!=null){
			if(doc.properties["doc:lock"]==null || (doc.properties["doc:lock"]!=null && doc.properties["doc:lock"]=="false")){
				Choc.Picker.getForm({
				    type:aspect,
				    mode:"edit",
				    form:"edit",
				    noderef:Choc.Docs.currentDoc,
				    callback:function(){
				    	$("#tit-breadcrumb a").last().click();
				    }
				});
			} else {
				Choc.poptime("<div class='text-center'><i class='icon lock'></i><br/>Su questo documento non è possibile modificare i metadati!</div>");
			}
		} else {
			if (typeOfDoc != "cm:content" && Choc.types[typeOfDoc]){
				Choc.Picker.getForm({
				    type:typeOfDoc,
				    mode:"edit",
				    form:"edit",
				    noderef:Choc.Docs.currentDoc,
				    callback:function(){
				    	$("#tit-breadcrumb a").last().click();
				    }
				});
			}
			else{
				var bodyCode = "<div class='ui warning message'>Il documento non ha ancora un tipo associato</div>";
				bodyCode += "<div class='ui selection dropdown' id='tit-action-meta-choose-type'>";
				bodyCode += "<i class='icon dropdown'></i><div class='text'>Scegli tipo</div>";
				bodyCode += "<div class='menu'>";
				$.each(Choc.types, function(index, value){
					if(value.isDoc){
						bodyCode += "<div class='item' data-value='"+index+"'>"+value.name+"</div>";
					}
				});
				bodyCode += "</div></div>";
				Choc.Picker.putCode({
					header: "Tipo documento",
					body: bodyCode,
					goHtml: "<i class='icon check'></i>Conferma",
					go: function(){
						var type = $("#tit-action-meta-choose-type").dropdown("get value");
						if(type){
							if (Choc.types[type].isType){
								Choc.Docs.specializeType(Choc.Docs.currentDoc, type, function(){
									$("#tit-breadcrumb a").last().click();
								});
							}
							else{
								Choc.Docs.aspects(Choc.Docs.currentDoc, [type], [], function(){
									$("#tit-breadcrumb a").last().click();
								});
							}
						}
						Choc.Picker.code.destroy();
					}
				});
				$("#tit-action-meta-choose-type").dropdown();
			}
		}
	},
	// function to import document
	_importDocs: function(){
		var bHtml = "<div class='ui form'><div class='field'><label>Path cartella da cui importare</label>";
		bHtml += "<input id='choc-service-code-path' type='text' placeholder='Path della cartella da cui importare' /></div></div>";
		bHtml += "<div class='ui warning message'><i>* Attenzione: eventuali file con lo stesso nome saranno sovrascritti!</i></div>";
		Choc.Picker.putCode({
			header: "Nuova importazione da File System",
			body: bHtml,
			go: function(){
				var path = $.trim($("#choc-service-code-path").val());
				if(path.length==0){
					Choc.poptime("Non hai specificato il path...", "warning");
				} else if(path[0]!="/"){
					Choc.poptime("Devi specificare un path assoluto...", "warning");
				} else {
					Choc.Docs.importDocs(Choc.Docs.currentParent, path, function(res){
						Choc.Picker.code.destroy();
						$("#tit-breadcrumb a").last().click();
						if(res.status=="started"){
							Choc.poptime("Importazione avvenuta in "+(res.duration/1000000000).toFixed(1)+" secondi");
							if(res.created>0){
								Choc.poptime("Creati "+res.created+" documenti", "info");
							}
							if(res.replaced>0){
								Choc.poptime("Sovrascritti "+res.replaced+" documenti", "warning");
							}
							if(res.skipped>0){
								Choc.poptime("Ignorati "+res.skipped+" documenti", "warning");
							}
						} else {
							Choc.alert("Errore! "+res.error, "danger");
						}
					});
				}
			}
		});
	},
	// set permissions
	_setPermissions: function(){
		Choc.Picker.setPermissions({
			noderef: Choc.Docs.currentDoc || Choc.Docs.currentParent,
			callback: function(res){
				if(res.success){
					Choc.alert("Permessi salvati con successo!");
					var breads = $("#tit-breadcrumb a");
					breads.last().click();
					breads.each(function(){
						Choc.Docs.get($(this).data("noderef"), $.noop);
					});
				} else {
					Choc.alert("Errore durante il salvataggio dei permessi!","danger");
					location.reload();
				}
			}
		});
	},
	// calculate fascicolo number
	_fascicoloNumber: function(node, onlyBreadcrumb){
        if (node && node.properties["tit:baseFolderNumber"]) {
			var anno = node.properties["cm:created"].iso8601.substr(0,4), fascNumber = "", roman;
			// se non sono in modalità ricerca
			if($("#tit-breadcrumb").is(":visible")){
				$("#tit-breadcrumb a").each(function(idx, el){
                    var noderef = $(el).data('noderef');
                    var model = $(el).data('model');
                    if (model === 'tit:titolo') {
                        roman = Choc.Docs.docs[noderef].properties["tit:titoloNumeroRomano"];
                    } else if (model === 'tit:classe' || model === 'tit:fascicolo'){
                        var baseNumber = Choc.Docs.docs[noderef].properties["tit:baseFolderNumber"];
                        if (baseNumber) {
                            if(fascNumber){
                                fascNumber += '.';
                            }
                            fascNumber += baseNumber;
                        } else {
                            fascNumber = "";
                            return;
                        }
                    }
                });
			}
            var number = "";
			if(fascNumber) {
                number = anno + (roman ? "-" + roman : "") + "/" + fascNumber;
                if (!onlyBreadcrumb) {
                    number += (fascNumber ? "." : "") + node.properties["tit:baseFolderNumber"];
                }
            }
			return number;
		} else {
			return "";
		}
	},
	// download multiple docs
	_multipleDownload: function(){
		var zipname = Choc.Docs.multipleSelection.length>1 ? "docs.zip" : null;
		Choc.Docs.Actions.downloadZip(Choc.Docs.multipleSelection, zipname);
	},
	// download folder
	_folderDownload: function(){
		Choc.Docs.Actions.downloadZip([Choc.Docs.currentParent], encodeURIComponent(Choc.Docs.docs[Choc.Docs.currentParent].properties["cm:name"])+".zip");
	},
	_selectAllTit: function(){
		if ( !$('.item.type-content .ui.checkbox').hasClass('ui checkbox left floated checked') ) {
			$('.item.type-content .ui.checkbox').checkbox('check');
		} else {
			$('.item.type-content .ui.checkbox').checkbox('uncheck');
		}
	},
	// load new version
	_loadVersion: function(){
    	var action = Choc.Actions.getAction("load-version");
    	action.execute(Choc.Docs.docs[Choc.Docs.currentDoc], null, function(){
            $("#tit-breadcrumb a").last().click();
        });
	},
	// revert version of node
	_revertNode: function(btnEl){
		btnEl = $(btnEl).parents("[data-version]");
		var version = btnEl.data("version"),
			html = "<div class='ui info message'>Stai creando una nuova versione ripristinando la versione "+version+" del documento</div>";
		html += "<div class='ui form'>";
		html += "<div class='field'><label>Commento versione</label><input type='text' name='comment' /></div>";
		html += "<div class='grouped fields'><label>Versione:</label>";
		html += "<div class='field'><div class='ui radio checkbox checked'>";
		html += "<input type='radio' name='major' value='false' checked='checked'><label>Minor</label></div></div>";
		html += "<div class='field'><div class='ui radio checkbox'>";
		html += "<input type='radio' name='major' value='true'><label>Major</label></div></div>";
		html += "</div></div>";
		Choc.Picker.putCode({
			header: "Ripristina versione",
			body: html,
			go: function(){
				var values = Choc.Picker.code.body.find('.ui.form').form("get values");
				values.noderef = Choc.Docs.currentDoc;
				values.version = version;
				values.callback = function(res){
					if(res.success){
						Choc.Docs.get(Choc.Docs.currentDoc, function(versionItem){
							Choc.insertAudit({
								type: Choc.auditsConst.document,
								action: "Ripristino versione precedente",
								noderef: versionItem.nodeRef,
								params: {
									"Versione Ripristinata": version,
									"Numero Nuova Versione": versionItem.properties["cm:versionLabel"],
									"Commento": values.comment
								}
							});
						});
						Choc.poptime("Versione ripristinata con successo!");
                        Choc.Picker.code.destroy();
                        $("#tit-breadcrumb a").last().click();
					} else {
						Choc.poptime("Errore durante il ripristino!!!!", "danger");
					}
				}
				Choc.Docs.revert(values);
			}
		});
		Choc.Picker.code.body.find('.ui.form .ui.checkbox').checkbox();
	},
	_checkoutCancel: function(){
		Choc.Docs.getAssociations(Choc.Docs.currentDoc, "cm:original", function(assocs){
			Choc.Docs.Actions.checkoutCancel(Choc.Docs.currentDoc, function(res){
				if(res.overallSuccess){
					var originalNoderef = null;
					if(assocs.items["cm:original"]){
						for(var on in assocs.items["cm:original"].elements){
							originalNoderef = on;
						}
					}
					Choc.insertAudit({
						type: Choc.auditsConst.document,
						action: "Annullamento checkout del documento",
						noderef: originalNoderef
					});
					Choc.alert("Checkout annullato con successo!");
					$("#tit-breadcrumb a").last().click();
				} else {
					Choc.poptime("Impossibile annullare il checkout!!!!", "danger");
				}
			});
		});
	},
    _copyLink: function () {
		var doc = Choc.Docs.docs[Choc.Docs.currentDoc],
			url = location.protocol + "//" + location.host + "/alfresco/s"+doc.contentURL;
        if (!navigator.clipboard) {
        	Choc.confirm({
				message: "<b>Il tuo browser non supporta la copia diretta negli appunti. Seleziona e copia manualmente il seguente link:</b> "+url,
				hideButtons: true
			});
		} else {
            navigator.clipboard.writeText(url);
            Choc.poptime("Link copiato", "info");
		}
    }
});
	
})();
