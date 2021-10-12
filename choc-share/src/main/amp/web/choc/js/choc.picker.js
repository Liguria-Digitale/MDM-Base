/**
 * Choc @Picker Module
 * @namespace Choc
*/

(function(){

/**
 * @Picker module
 */
Choc.Picker = {

    queue: [],
    escKeyClose: true,
	// collection of node returned from server
	nodes: {},
	// doclib picker div
	doclib: null,
	/**
	 * function to open doclib picker
	 * config object:
	 * 		multiple: boolean to choose if multiple selection is active. default is true
	 * 		upload: boolean to choose if upload div is displayed. default is true
	 * 		type: custom type for selection. default id "cm:content"
	 * 		root: archive to choose (doclib, user or shared). if null, doclib is root
	 * 		callback: callback function for selection nodes (name, noderef)
	 * 		noderefs: noderefs of selected value
	 */
	openDoclib: function(config){
		// get dom objects
		var doclib = function(config, DOM){
		    this.id = 'doclib';
            this.picker = DOM;
			this.selected = this.picker.find(".choc-service-doclib-selected");
			this.selected.html("<div class='toremove item'>Nessun elemento selezionato</div>");
			this.parent = this.picker.find(".choc-service-doclib-parent");
			this.uploadDivs = this.picker.find(".choc-service-doclib-upload");
			this.archives = this.picker.find(".choc-service-doclib-archives");
			this.docs = this.picker.find(".choc-service-doclib-archive");
			this.pattern = this.picker.find(".choc-service-doclib-pattern");
			this.pagination = this.picker.find(".choc-service-doclib-pagination");
			// get picker options
			this.upload = (config.upload==null ? true : config.upload);
			this.multiple = (config.multiple==null ? true : config.multiple);
			this.selectable = config.selectable || function(){return true;};
			this.root = config.root || "user";
			this.callback = config.callback || function(){};
			this.destination = config.destination;
			this.noderefs = config.noderefs;
			// save titolario page for security
			this.titolarioPage = Choc.Docs.currentPage;
			Choc.Docs.currentPage = 0;

			var $pagination = this.picker.find('.choc-service-doclib-pagination2 .pager');
            this.pagination2 = new Choc.Pagination({
                container: $pagination,
                elements: 50,
                every: function(){
                    Choc.Docs.currentPage = Choc.Picker.doclib.pagination2.page;
                    var parentRef = Choc.Picker.doclib.parents.length>0 ? Choc.Picker.doclib.parents[Choc.Picker.doclib.parents.length-1] : Choc.Picker.doclib.root;
                    Choc.Docs.children(parentRef, Choc.Picker.doclib.drawChildren);
                }
            });

			// show upload if type is d
			if(this.upload){
				this.uploadDivs.removeClass("hide");
				this.uploadDivs.dropdown({
					action: "nothing"
				});
				Choc.Docs.getUserHome(function(temp){
					if(!Choc.Picker.doclib.destination){
                        Choc.Picker.doclib.destination = temp.nodeRef;
                    }
                    var fileUpload = DOM.find('.fileupload');
                    if(Choc.ie9){
                        fileUpload.removeClass("hide");
                        DOM.find('.choc-service-doclib-upli').remove();
                    }
                    var format = (Choc.ie9) ? 'text' : 'json';
                    fileUpload.fileupload({
                        url: Choc.alf_url+"api/upload?format="+format,
                        dataType: 'json',
                        forceIframeTransport: Choc.ie9,
                        submit: function(e, data){
                        	if (data.files[0].size > 0){
            	                data.formData = {
            	                    destination: Choc.Picker.doclib.destination,
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
                            Choc.Docs.docs[result.nodeRef] = {properties:{"cm:name":result.fileName}};
                            Choc.Picker.doclib.select(result.nodeRef, true);
                        },
                        fail: function(e, data){
                        	var message = "Errore durante l'upload del file";
                        	if (data.files[0].size == 0){
                        		message += ", non è possibile caricare file vuoti.";
                        	}
                            Choc.alert(message,"danger");
                        }
                    });
				});
			} else {
				this.uploadDivs.addClass("hide");
			}
			// function to create new nodes of type 'Voce Titolario' in the 'Classificazione' form
			this.classificazioneCreateVoce = function(){
				var currentFolder = Choc.Docs.docs[Choc.Picker.doclib.currentParent], type;
				if (currentFolder.type=='cm:folder'){
					type = "cm:folder";
				}else if (currentFolder.type=='tit:baseFolder'){
					type = "tit:titolo";
				}else if (currentFolder.type=='tit:titolo'){
					type = "tit:classe";
				}else{
					type = "tit:fascicolo";
				}

				Choc.Picker.getForm({
					type:type,
					mode:"new",
					form:"create",
					noderef: Choc.Picker.doclib.currentParent,
					callback:function(noderef){
						Choc.Docs.get(noderef, function(itm){
							Choc.Picker.doclib.getChildren(itm.nodeRef);
						});
					}
				});
			};

			// previous parent for level up
			this.parents = new Array();
			// function to choose archive
			this.chooseArchive = function(archive){
				if(archive==null)return;
				Choc.Picker.doclib.root = archive;
				Choc.Picker.doclib.getChildren();
				// update ui
                Choc.Picker.doclib.archives.children().removeClass("active");
                Choc.Picker.doclib.archives.children("[data-value='"+archive+"']").addClass("active");
			};
			// function to scroll children
			this.getChildren = function(parentRef, withPattern){
				if(parentRef==null){
					Choc.Picker.doclib.parents = new Array();
					var openArchive = function(doclib){
						Choc.Picker.doclib.root = doclib.nodeRef;
						Choc.Picker.doclib.getChildren(doclib.nodeRef);
					};
					if(Choc.Picker.doclib.root=="user"){
						Choc.Docs.getUserHome(openArchive);
					} else if(Choc.Picker.doclib.root=="shared"){
						Choc.Docs.getContainer("shared", openArchive);
					} else if(Choc.Picker.doclib.root.indexOf("workspace://SpacesStore/") >= 0){
						Choc.Docs.get(Choc.Picker.doclib.root, openArchive);
					} else {
						Choc.Docs.getContainer("documentLibrary", openArchive);
					}
					return;
				}
				Choc.Docs.currentPage = 0;
				Choc.Docs.children(parentRef, function(nodes, totalElements){

					Choc.Picker.doclib.pagination2.total = totalElements;
					Choc.Picker.doclib.currentParent = parentRef;

					//Check write permission to show "Nuova Voce Titolario";
					var voce = DOM.find(".choc-service-doclib-nuova-voce-titolario");
					var crrNd = Choc.Docs.docs[Choc.Picker.doclib.currentParent];
					if(crrNd.type.indexOf("tit:")<0 || !(Choc.Docs.haveWritePermission(crrNd))){
						voce.addClass("hide");
						if (crrNd.type == "tit:fascicolo" || crrNd.type == "tit:classe"){
							if(Choc.Docs.haveManagePermission(crrNd)){
								voce.removeClass("hide");
							}
						}
					}else{
						voce.removeClass("hide");
					}

					// draw children
					Choc.Picker.doclib.drawChildren(nodes);
					// draw parents
					var parent = Choc.Picker.doclib.parent, rootNode = Choc.Docs.docs[Choc.Picker.doclib.root], breadcrump = "";
					parent.empty();
					parent.append("<div class='item'><div class='ui icon tiny button' onclick='Choc.Picker.doclib.up();'><i class='icon level up'></i></div></div>");
					// add other parents, without root
					if(Choc.Docs.docs[parentRef].aspects.indexOf("st:siteContainer")==-1){
						Choc.Picker.doclib.parents.push(parentRef);
					}
					// create html for breadcrumb, root exists always
					breadcrump += "<div class='item'>";
					if(Choc.Picker.doclib.selectable(rootNode)){
						breadcrump += "<div class='ui blue icon tiny button' onclick='Choc.Picker.doclib.select(\""+Choc.Picker.doclib.root+"\", false);'><i class='icon plus'></i></div> ";
					}
					if (rootNode.properties["cm:name"] != "Non Associati"){
						breadcrump += "<i class='icon folder open'></i>Archivio</div>";
					}
					var parents = Choc.Picker.doclib.parents;
					for(var i=0;i<parents.length;i++){
						var ref = parents[i], refNode = Choc.Docs.docs[ref];

						//caso classificazione titolario
						var nodeNum="";
						if(refNode){
							if(refNode.type== "tit:titolo" && refNode.properties["tit:titoloNumeroRomano"]!=null){
								nodeNum = refNode.properties["tit:titoloNumeroRomano"] + " - ";
							}
							else if(refNode.type== "tit:classe" && refNode.properties["tit:baseFolderNumber"]!=null){
								nodeNum = refNode.properties["tit:baseFolderNumber"] + " - ";
							}
						}

						breadcrump += "<div class='item'>";
						if(refNode && Choc.Picker.doclib.selectable(refNode)){
							breadcrump += "<div class='ui blue icon tiny button' onclick='Choc.Picker.doclib.select(\""+ref+"\", false);'><i class='icon plus'></i></div> ";
						}
						breadcrump += "<i class='icon folder open'></i> "+(refNode ? nodeNum+refNode.properties["cm:name"] : "Archivio")+"</div>";
					}
					parent.append(breadcrump);
				}, withPattern ? $.trim(Choc.Picker.doclib.pattern.val()) : null);

			};
			this.refresh = function () {
                this.parents.pop();
				this.getChildren(this.currentParent, true);
            };
			// get prev page
			this.prevPage = function(){
				if(Choc.Docs.currentPage>0){
					Choc.Docs.currentPage--;
					var parentRef = Choc.Picker.doclib.parents.length>0 ? Choc.Picker.doclib.parents[Choc.Picker.doclib.parents.length-1] : Choc.Picker.doclib.root;
					Choc.Docs.children(parentRef, Choc.Picker.doclib.drawChildren);
				}
			};
			// get prev page
			this.nextPage = function(){
				Choc.Docs.currentPage++;
				var parentRef = Choc.Picker.doclib.parents.length>0 ? Choc.Picker.doclib.parents[Choc.Picker.doclib.parents.length-1] : Choc.Picker.doclib.root;
				Choc.Docs.children(parentRef, function(nodes){
					if($.isEmptyObject(nodes)){
						Choc.Docs.currentPage--;
					} else {
						Choc.Picker.doclib.drawChildren(nodes);
					}
				});
			};
			// function to draw children (paginated)
			this.drawChildren = function(nodes){
				var html = "";
				if($.isEmptyObject(nodes)){
					html += "<div class='ui small info message'>Nessun elemento</div>";
				} else {
					for (var n in nodes) {
						var node = nodes[n];
						if (node.aspects.indexOf("sys:hidden") == -1 && node.aspects.indexOf("cm:checkedOut") == -1) {
							var nodeRef = node.nodeRef;
							var nodeName = node.properties["cm:name"];
							//caso classificazione titolario
							var nodeNum="";
							if(node.type== "tit:titolo" && node.properties["tit:titoloNumeroRomano"]!=null){
								nodeNum = node.properties["tit:titoloNumeroRomano"] + " - ";
							}
							else if(node.type== "tit:classe" && node.properties["tit:baseFolderNumber"]!=null){
								nodeNum = node.properties["tit:baseFolderNumber"] + " - ";
							}

							html += "<div class='item'>";
							if (Choc.Picker.doclib.selectable(node)) {
								html += "<div class='ui blue icon tiny button' onclick='Choc.Picker.doclib.select(\"" + nodeRef + "\", false);'><i class='icon plus'></i></div> ";
							}
							if (node.isContainer) {
								html += "<a onclick='Choc.Picker.doclib.getChildren(\"" + nodeRef + "\")'><i class='icon folder open'></i>" +nodeNum + nodeName + "</a>";
							} else {
								html += "<a class='choc-service-doclib-isfile' onclick='Choc.Picker.showPreview({noderef:\"" + nodeRef + "\"});'>";
								html += Choc.Docs.icon(nodeName) + nodeName + "</a>";
							}
							html += "</div>";
						}
					}
				}
				Choc.Picker.doclib.docs.empty();
				Choc.Picker.doclib.docs.append(html);

				Choc.Picker.doclib.pagination2.update();
			};
			// function to up level children
			this.up = function(){
				if(this.parents.length>1){
					var ref = this.parents[this.parents.length-2];
					this.parents.pop();
					this.parents.pop();
					this.getChildren(ref);
				} else {
					if(this.parents.length>0){
						this.parents.pop();
					}
					this.getChildren(this.root);
				}
			};
			this.select = function(noderef, isUpload){
				if(this.selected.find("[data-noderef='"+noderef+"']").length==0){
					// recupero il nodo completo in background per eventuali return
					Choc.Docs.get(noderef,function(){});
					// se sono in modalità singolo documento, rimuovo eventuali altri docs
					var isOk = true;
					if(!this.multiple){
						this.selected.find("[data-noderef]").each(function(){
							Choc.Picker.doclib.checkAndRemove(this);
						});
						if (this.selected.find("[data-noderef]").length == 0){
							this.selected.empty();
						}
						else{
							isOk = false;
						}
					}
					if (isOk) {
						this.selected.find(".toremove").remove();
						var node = Choc.Docs.docs[noderef];
						var nodeName = node.properties["cm:name"];
						var html = "<div class='item' data-noderef='" + noderef + "' data-isupload='" + isUpload + "'>";
						html += "<div class='ui blue label'>";
						if (node.isContainer) {
							html += "<i class='icon folder open'></i>";
						} else {
							html += Choc.Docs.icon(nodeName);
						}
						html += nodeName;
						html += "<i onclick='Choc.Picker.doclib.checkAndRemove(this);' class='icon delete'></i>";
						html += "</div>";
						this.selected.append(html);
					}
				}
			};
			this.checkAndRemove = function(el, force){
				el = $(el);
				if(el.data("noderef")==null){
					el = $(el).parents("[data-noderef]");
				}
				var isupload = el.data("isupload");
				if(isupload==true){
					Choc.Docs.Actions.deleteNode(el.data("noderef"), function(){});
					el.remove();
				}
				else {
					var canRem = false;
					var dc = Choc.Docs.docs[el.data("noderef")];
					if (dc){
						if (Choc.Docs.haveManagePermission(dc) || Choc.Docs.haveWritePermission(dc)){
							canRem = true;
						}
					}
					if (canRem || force) {
						el.remove();
					}
					else{
						Choc.poptime("Non hai il permesso per eseguire questa operazione", "danger");
					}
				}
			};
			this.ok = function(){
				var selected = [];
				this.selected.find("[data-noderef]").each(function(){
					var ref = $(this).data("noderef");
					selected.push({
						noderef: ref,
						name: Choc.Docs.docs[ref].properties["cm:name"],
						isUpload: $(this).data("isupload")
					});
				});
				this.callback(selected);
				this.destroy();
			};
			this.destroy = function(withDelete){
				if(withDelete){
					this.selected.children().each(function(){
						Choc.Picker.doclib.checkAndRemove($(this), true);
					});
				}
				Choc.Docs.currentPage = Choc.Picker.doclib.titolarioPage;
				Choc.Picker.hidePicker(this, "doclib");
			};

			// show picker
			Choc.Picker.showPicker(this);
		};

		this.doclib = new doclib(config, Choc.Picker.createPicker('doclib', config));
		this.doclib.chooseArchive(this.doclib.root);

		if (this.doclib.noderefs){
			var uri = Choc.choc_url + "picker/generalget?nodes="+this.doclib.noderefs;
			$.getJSON(uri, function(res){
				for(var e in res.elements){
					var element = res.elements[e];
					Choc.Docs.docs[e] = {properties:{"cm:name":element.name},isContainer:element.iscontainer};
				}
				var values = Choc.Picker.doclib.noderefs.split(';');
				for (var v = 0; v < values.length; v++){
					if (values[v].length >= 25){ //MIN NODEREF LENGTH
						Choc.Picker.doclib.select(values[v]);
					}
				}
			});
		}
	},
	// user picker instance
	users: null,
	/**
	 * function to open user picker
	 * config object:
	 * 		multiple: boolean to choose if multiple selection is active. default is true
	 * 		uo: boolean to choose if picker return selected uos or return users of uos
	 * 		callback: callback function for selection users
	 */
	searchUsers: function(config){
		// get dom objects
		var users = function(config, DOM){
		    this.id = 'users';
			this.picker = DOM;
			this.selected = this.picker.find(".choc-service-user-selected");
			this.selected.html("<div class='toremove item'>Nessun contatto selezionato</div>");
			this.input = this.picker.find(".choc-service-user-search");
			this.input.find("input").val("");
			this.uos = this.picker.find(".choc-service-user-uos");
			this.users = this.picker.find(".choc-service-user-users");
			this.users.empty();
			this.selectLeader = this.picker.find(".choc-service-user-leader");
			this.lists = this.picker.find(".choc-service-user-lists-dd");
			// get picker options
			this.multiple = (config.multiple==null ? true : config.multiple);
			this.onlyleader = (config.onlyleader==null ? false : config.onlyleader);
            if(this.onlyleader){
                this.selectLeader.checkbox("check");
                this.selectLeader.checkbox("set disabled");
            } else {
                this.selectLeader.checkbox("uncheck");
                this.selectLeader.checkbox("set enabled");
            }
			this.returnUo = (config.uo==null ? false : config.uo);
			if (this.multiple || this.onlyleader){
				this.picker.find(".choc-service-user-uos-container").removeClass("hide");
				this.picker.find(".header-choc-service-user-search").removeClass("hide");
			}
			else{
				this.picker.find(".choc-service-user-uos-container").addClass("hide");
				this.picker.find(".header-choc-service-user-search").addClass("hide");
			}
			this.callback = config.callback || function(){};
			this.onlyuo = (config.onlyuo==null ? false : config.onlyuo);
			this.showLists = (config.lists==null ? false : config.lists);
			if(this.showLists){
                this.picker.find(".choc-service-user-lists").removeClass("hide");
                this.lists.dropdown({
                	action: "select",
                	onChange: function (value) {
                        Choc.Picker.users.selectList(value);
                    }
				})
			} else {
                this.picker.find(".choc-service-user-lists").addClass("hide");
			}
			// function to scroll children
			this.search = function(event){
				if(event!=null && event.keyCode!=13)return;
				var q = $.trim(Choc.Picker.users.input.find("input").val());
				if(q.length==0 || q=="*"){
					Choc.poptime("Inserisci almeno un carattere!", "warning");
					return;
				}
				Choc.Org.searchUsers(q, true, false, 10, function(users){
					Choc.Picker.users.draw(users);
				});
			};
			// function for user draw
			this.draw = function(users){
				var html = "";
				for(var u in users){
					var user = users[u];
					html += "<div class='item' data-user='"+user.username+"'>";
					html += "<i onclick='Choc.Picker.users.select(this);' class='cursor pointer blue bordered inverted small icon plus'></i>";
					html += "<div class='content'><div class='header'>"+user.name+" "+(user.surname||"")+"</div></div></div>";
				}
				Choc.Picker.users.users.empty();
				Choc.Picker.users.users.append(html);
			};
			// function for select
			this.select = function(btnEl){
				var liEl = $(btnEl).parent(),
					username = liEl.data("user"),
					name = liEl.find(".header").text();
				this.selectUser(username, name);
			};
			this.selectUser = function (username, name) {
                if(this.selected.find("[data-user='"+username+"']").length==0){
                    if(!this.multiple){
                        this.selected.empty();
                    }
                    this.selected.find(".toremove").remove();
                    var html = "<div class='item' data-user='"+username+"'><div class='ui blue label'><i class='icon user'></i>";
                    html += (name || username)+"<i class='icon delete' onclick='$(this).parent().parent().remove();'></i></div></div>";
                    this.selected.append(html);
                }
            };
			// function for retrieve uos
			this.loadUos = function(){
				var me = this;
				if(me.uos.data().moduleDropdown){
					me.uos.dropdown("restore defaults");
					me.uos.dropdown("clear");
				} else {
					Choc.Org.getUos(function(res){
						// init tree
                        new Choc.Org.Chart({
							container: DOM.find('.choc-service-user-uos-tree'),
                            select: Choc.Picker.users.uoSelect
                        });
						// init dropdown
                        Choc.Picker.drawUos(res, me.uos, Choc.Picker.users.uoSelect);
					});
				}
			};
			this.loadUos();
			// function on select uo from select
			this.uoSelect = function(uo){
				if(uo){
					var uoObj = Choc.Org.getUo(uo);
					if(Choc.Picker.users.selected.find("[data-uo='"+uo+"']").length==0){
						if(!Choc.Picker.users.multiple){
							Choc.Picker.users.selected.empty();
						}
						Choc.Picker.users.selected.find(".toremove").remove();
						if(!Choc.Picker.users.selectLeader.checkbox("is checked")) {
                            var html = "<div class='item' data-uo='" + uo + "'><div class='ui blue label'><i class='icon sitemap'></i>" + uoObj.name;
                            html += "<i class='icon delete' onclick='$(this).parent().parent().remove();'></i></div></div>";
                            Choc.Picker.users.selected.append(html);
                        } else {
							var leaderExists = false;
                            for (var us in uoObj.users){
                            	var cuser = uoObj.users[us];
                                if (cuser.leader){
                                	leaderExists = true;
                                    if(Choc.Picker.users.selected.find("[data-user='"+cuser.username+"']").length==0){
                                        var html = "<div class='item' data-user='" + cuser.username + "'><div class='ui blue label'><i class='icon user'></i>";
                                        html += cuser.name + "<i class='icon delete' onclick='$(this).parent().parent().remove();'></i></div></div>";
                                        Choc.Picker.users.selected.append(html);
                                    } else {
                                        Choc.poptime("Il responsabile di questa UO è già presente negli utenti selezionati", "warning");
									}
                                    break;
                                }
                            }
                            if(!leaderExists){
                            	Choc.poptime("In questa UO non è stato selezionato il responsabile", "warning");
							}
						}
					}
					if(uoObj.users.length==0){
						Choc.poptime("Attenzione, al momento non è presente alcun utente nell'UO","warning");
					}
					if (Choc.Picker.users.onlyleader){
						var thereIsLeader = false;
						for (var us in uoObj.users){
							if (uoObj.users[us].leader){
								thereIsLeader = true;
							}
						}
						if (!thereIsLeader){
							Choc.poptime("Attenzione, al momento non è nominato alcun responsabile per l'UO","warning");
						}
					}
				}
			};
			this.loadLists = function () {
                var me = this;
				Choc.Org.getLists(function (lists) {
					if($.isEmptyObject(lists)){
                        me.picker.find(".choc-service-user-lists").addClass("hide");
					} else {
						var listEl = me.lists, menuEl = listEl.children(".menu");
						menuEl.empty();
						for(var l in lists){
							var list = lists[l];
							menuEl.append("<div class='item' data-value='"+l+"'>"+list.properties["cm:name"]+"</div>");
						}
						listEl.dropdown("refresh");
					}
				});
            };
            this.selectList = function (noderef) {
				var list = Choc.Org.lists[noderef],
					auths = (list.properties["org:listTo"] || []).concat(list.properties["org:listCc"] || []);
                for(var a in auths){
                    var auth = auths[a];
                    if(auth.indexOf("workspace://")==-1){
                        Choc.Picker.users.selectUser(authchoc-service-sendmail-to);
                    } else {
                        Choc.Picker.users.uoSelect(auth);
                    }
                }
            };
			this.ok = function(){
				var selected = [];
				var selectedUsers = [];
				this.selected.find("[data-user]").each(function(){
					var liEl = $(this);
					var username = liEl.data("user");
					selectedUsers.push(username);
					selected.push({
						username: username,
						name: $.trim(liEl.text())
					});
				});
				this.selected.find("[data-uo]").each(function(){
					var liEl = $(this);
					var nodeRef = liEl.data("uo");
					var uo = Choc.Org.getUo(nodeRef);
					if(Choc.Picker.users.returnUo){
						selected.push({
							noderef: nodeRef,
							name: uo.name
						});
					} else {
						var uoUsers = uo.users;
						for (var u in uoUsers){
							var uoUser = uoUsers[u];
							if(selectedUsers.indexOf(uoUser.username)==-1){
								if (Choc.Picker.users.onlyleader){
									if (!uoUser.leader){
										continue;
									}
								}
								selected.push({
									username: uoUser.username,
									name: uoUser.name
								});
							}
						}
					}
				});
				if(selected.length>0){
					this.callback(selected);
				}
				this.destroy();
			};
			this.destroy = function(){
				Choc.Picker.hidePicker(this, "users");
			};
			// show picker
			if (this.onlyuo){
				//hide single user search
				this.picker.find('.header-choc-service-user-search').hide();
				this.picker.find('.choc-service-user-search').hide();
				this.picker.find('.choc-service-user-users').hide();
			}
			else{
				//show single user search
				this.picker.find('.header-choc-service-user-search').show();
				this.picker.find('.choc-service-user-search').show();
				this.picker.find('.choc-service-user-users').show();
			}
            if(this.showLists){
                this.loadLists();
            }

			Choc.Picker.showPicker(this);
		};

		this.users = new users(config, Choc.Picker.createPicker('users', config));
	},
	// form picker instance
	form: null,
	/**
	 * function to open form picker
	 * config object:
	 * 		mode: 'new' or 'edit' (default is new)
	 * 		type: type to create or edit
	 * 		noderef: parent for mode new, node for mode edit
	 * 		form: name of form to draw (default is "create")
	 * 		header: text to insert in header (optional)
	 * 		callback: callback function with boolean for success
	 */
	getForm: function(config){
		// get dom objects
		var form = function(config, DOM){
		    this.id = 'form';
			this.picker = DOM;
			$(".choc-service-form-column").prop("class", (config.width||"eight")+" wide column");
			this.form = this.picker.find(".choc-service-form-form");
			this.header = this.picker.find(".choc-service-form-header");
			// config object
			this.mode = config.mode || "new";
			this.formName = config.form || "create";
			this.type = config.type;
			this.noderef = config.noderef;
			this.callback = config.callback || $.noop;
			this.onready = config.onready || $.noop;
			this.headerText = config.header;
			this.initForm = Choc.types[this.type].init || $.noop;
			this.ready = false;
			this.gofunction = config.gofunction || null;
			// build header form
			if(this.headerText){
				this.header.html(this.headerText);
			} else {
				this.header.html((this.mode=="new"?"Crea ":"Modifica ")+Choc.types[this.type].name);
			}
			// empty form
			this.form.empty();
			Choc.Forms.draw({
				type:this.type,
				form:this.formName,
				container:this.form,
				submit: function(data){
					Choc.Picker.form.go(data);
				}
			});
			if(this.mode=="edit"){
				Choc.Docs.get(this.noderef, function(item){
					// set current values in input
					Choc.Forms.drawValues(item, Choc.Picker.form.type, Choc.Picker.form.form.find(".ui.form"));
					Choc.Picker.form.initForm(Choc.Picker.form.mode);
					Choc.Picker.form.ready = true;
					Choc.Picker.form.onready();
				});
			} else {
				this.initForm(this.mode);
				this.ready = true;
			}
			if (this.gofunction){
				this.go = this.gofunction;
			}
			else{
				this.go = function(data){
					data.mode = Choc.Picker.form.mode;
					data.type = Choc.Picker.form.type;
					data.noderef = Choc.Picker.form.noderef;
					Choc.Docs.post(data, function(res){
	                    var typeName = Choc.types[Choc.Picker.form.type].name;
						if(res.success){
							var mode = Choc.Picker.form.mode=="new" ? "creato" : "modificato";
	                        Choc.poptime(typeName + " " + mode + " correttamente!");
							Choc.Picker.form.callback(res.noderef, data);
							Choc.Picker.form.destroy();
						} else {
	                        var message = res.message || 'Errore imprevisto!';
	                        if (message.indexOf("already exists") > -1) {
	                            message = typeName + " con stesso nome già esistente";
	                        }
	                        Choc.poptime(message, 'danger');
						}
					});
				};				
			}
			this.destroy = function(){
				Choc.Picker.hidePicker(this, "form");
			};
			// show picker
			Choc.Picker.showPicker(this);
		};

		this.form = null;
		this.form = new form(config, Choc.Picker.createPicker('form', config));

	},
	// preview picker instance
	preview: null,
	/**
	 * function to open doc preview
	 * config object:
	 * 		noderef: noderef to preview
	 */
	showPreview: function(config){
		// get dom objects
		var preview = function(config, DOM){
            this.id = 'preview';
			this.picker = DOM;
			this.name = this.picker.find(".choc-service-preview-name");
			this.current = this.picker.find(".choc-service-preview-page");
			this.canvas = this.picker.find(".choc-service-preview-canvas");
			this.canvas.addClass("hide");
			this.inputPage = this.picker.find(".choc-service-preview-numpage");
			this.noderef = config.noderef;
			this.node = Choc.Docs.docs[this.noderef];
			
			// shows div only if document is signed
			this.signDetails = this.picker.find(".choc-service-preview-signdetails");
			this.signDetails.addClass("hide");
			if (this.node.aspects.indexOf("sign:signed") != -1){
				this.signDetails.removeClass("hide");
			}
			this.picker.find(".downprintbrows").removeClass("hide");

			// properties for viewer
			this.pdf = null;
			this.scale = 1;
			this.page = 0;
			this.pages = 0;
			// me variable for scope injection
			var me = this;
			// function for start preview
			this.preview = function(node){
				me.name.text(node.properties["cm:name"]);
				PDFJS.getDocument(Choc.choc_url+"picker/preview?noderef="+me.noderef).then(function(pdf){
					$(".choc-service-preview-loading").remove();
					me.pdf = pdf;
					me.pages = pdf.numPages;
					me.drawPage(1);
					me.canvas.removeClass("hide");
				});
			};
			// function for draw a page
			this.drawPage = function(number){
				me.page = number;
				me.current.text("Pag. "+number+" di "+me.pages);
				me.inputPage.val(number);
				me.pdf.getPage(number).then(function(page){
					var width = me.picker.find(".column:first").width()*0.7;
					// me.scale is for zoom function, page.view[2] is width, page.view[3] is height
					var scale = width / page.view[2] * me.scale;
					var viewport = page.getViewport(scale);
					var canvas = me.canvas[0];
					var context = canvas.getContext('2d');
					canvas.height = viewport.height;
					canvas.width = viewport.width;
					var renderContext = {
						canvasContext: context,
						viewport: viewport
					};
					page.render(renderContext);
				});
			};
			// draw next page
			this.next = function(){
				if(this.page<this.pages){
					this.drawPage(this.page+1);
				}
			};
			// draw prev page
			this.prev = function(){
				if(this.page>1){
					this.drawPage(this.page-1);
				}
			};
			// zoom current page
			this.zoom = function(){
				if(this.scale<1.91){
					this.scale += 0.1;
					this.drawPage(this.page);
				}
			};
			this.dezoom = function(){
				if(this.scale>0.51){
					this.scale -= 0.1;
					this.drawPage(this.page);
				}
			};
			// Signature details Popup (document preview)
			this.getSignDetails = function(){
				var url = Choc.choc_url+"sign/details?noderef="+config.noderef;
				$.getJSON(url, function(res){
					if(res.success){
						DOM.find('.choc-service-preview-signdetails').popup({
							position: 'bottom center',
							html: Choc._render(Choc.mustache_url+"signature.details.ejs", res),
							lastResort: 'bottom left',
                            hoverable: true,
							variation: "very wide",
                            onHidden: function(){
                                DOM.find('.choc-service-preview-signdetails').popup('destroy')
                            }
						});
                        DOM.find('.choc-service-preview-signdetails').popup('show');
					} else {
						Choc.alert("Impossibile recuperare i dettagli di firma (lista firme vuota)!","warning");
					}
				}).fail(function(){
                    Choc.alert("Errore durante il recupero dei dettagli di firma","error");
				});
			};
			// draw to specified page
			this.gotoPage = function(){
				var val = this.inputPage.val();
				if(val.length>0 && !isNaN(parseInt(val))){
					var value = parseInt(val);
					if(value>0 && value<=this.pages){
						this.drawPage(value);
					}
				}
			};
			this.canvas.before("<div class='choc-service-preview-loading ui info message'>Caricamento anteprima in corso...</div>");
			if(this.node){
				this.preview(this.node);
			} else {
				Choc.Docs.get(this.noderef, function(item){
					Choc.Picker.preview.node = item;
					Choc.Picker.preview.preview(item);
				});
			}
			this.destroy = function(){
				Choc.Picker.hidePicker(this, "preview");
			};
			// show picker
			Choc.Picker.showPicker(this);
		};

		if (Choc.Picker.emlpreview != null){
			this.preview = new preview(config, Choc.Picker.createPicker('preview', config));
		}
		else{
			Choc.Docs.get(config.noderef, function(nde){
				var icd = Choc.Docs.icon(nde.properties["cm:name"]);
				if ((icd.indexOf("mail") >= 0)) {
					Choc.Picker.showEmlPreview({noderef: nde.nodeRef});
				} else {
					Choc.Picker.preview = new preview({noderef: nde.nodeRef}, Choc.Picker.createPicker('preview', {noderef: nde.nodeRef}));
				}
			}, null);
		}
		
	},
	// permissions picker instance
	permsName: {
		"SiteConsumer": "Sola Lettura",
        "SiteCollaborator": "Lettura/Gestione",
        "SiteManager": "Lettura/Scrittura"
	},
	perms: null,
	setPermissions: function(config){
		var perms = function(config, DOM){
		    this.id = 'perms';
			this.picker = DOM;
            this.inheritTable = this.picker.find('.choc-service-perms-inherited > tbody');
			this.permsTable = this.picker.find('.choc-service-perms-perms > tbody');
			this.inheritOn = $(".choc-service-perms-inheritOn");
			this.inheritOn.addClass("hide");
            this.inheritOff = $(".choc-service-perms-inheritOff");
            this.inheritOff.addClass("hide");
			this.callback = config.callback;
			this.noderef = config.noderef;
			this.node = Choc.Docs.docs[this.noderef];
			Choc.Org.getUos(function(){
				//Choc.Org.searchGroups(null, function () { //TODO CHIEDERE A FEDERICO LA NECESSITA
                    Choc.Picker.perms.drawPermix(Choc.Picker.perms.node.permissions);
                //});
			});
			this.drawPermix = function(permissions){
                Choc.Picker.perms.permsTable.empty();
                Choc.Picker.perms.inheritTable.empty();
				var perms = permissions.roles;
				// disegno i permessi
                if(!permissions.inherited){
                    Choc.Picker.perms.inheritTable.append("<tr><td>Permessi non ereditati</td><td></td></tr>");
                    Choc.Picker.perms.inheritOn.removeClass("hide");
                    Choc.Picker.perms.inheritOff.addClass("hide")
                } else {
                    Choc.Picker.perms.inheritOn.addClass("hide");
                    Choc.Picker.perms.inheritOff.removeClass("hide")
				}
				for(var p in perms){
                	Choc.Picker.perms.drawPermRow(perms[p]);
				}
				if(Choc.Picker.perms.permsTable.children().length==0){
                    Choc.Picker.perms.permsTable.append("<tr><td>Nessun permesso diretto</td><td></td></tr>");
				}
			};
			this.drawPermRow = function(permission){
                var perm = permission.split(";"), html = "", disabled = false;
                html += "<tr class='choc-service-perms-perm' data-auth=\""+perm[1]+"\"><td>";
                if(perm[1].indexOf("GROUP_")>-1){
                	if(perm[1]=="GROUP_site_"+Choc.site+"_SiteConsumer"){
                		html += "Tutti gli utenti dell'AOO";
					} else if (perm[1]=="GROUP_site_"+Choc.site+"_perm_canProtocolReadRis"){
                		disabled = true;
                		html += "Gruppo lettura protocolli riservati";
                	} else if (perm[1]=="GROUP_site_"+Choc.site+"_perm_canProtocolRead"){
                		disabled = true;
                		html += "Gruppo lettura protocolli";
                	} else {
                        var uo = Choc.Org.getUoFromGroup(perm[1]);
                        if (uo){
                        	html += "UO '" + uo.name + "'";
                        } else{
                        	html += "Gruppo di sistema";
                        	disabled = true;
                        }
                    }
                } else {
                    html += "Utente '"+perm[1]+"'";
                }
                html += "</td>";
                if(perm[3]=="INHERITED") {
                    html += "<td>" + Choc.Picker.permsName[perm[2]] + "</td>";
                } else {
                    html += "<td><div class='ui "+(disabled?"disabled ":"")+"dropdown'>";
                    html += "<input type='hidden' value='"+perm[2]+"' />";
                    html += "<div class='text'></div><i class='dropdown icon'></i><div class='menu'>";
                    html += "<div class='item' data-value='-'>Nessuno</div>";
                    for(var level in Choc.Picker.permsName){
                        html += "<div class='item' data-value='"+level+"'>"+Choc.Picker.permsName[level]+"</div>";
                    }
                    html += "</div></div></td>";
                }
                html += "</tr>";
                if(perm[3]=="INHERITED") {
                    Choc.Picker.perms.inheritTable.append(html);
                } else {
                    Choc.Picker.perms.permsTable.append(html);
                    Choc.Picker.perms.permsTable.find(".choc-service-perms-perm[data-auth='"+Choc.escapeSingleQuote(perm[1])+"'] .ui.dropdown").dropdown();
                }
			};
			this.add = function(){
				Choc.Picker.searchUsers({
					multiple: true,
					uo: true,
					callback: function(res){
						for(var e in res){
							var authority = res[e].username || Choc.Org.getUo(res[e].noderef).group;
							if(Choc.Picker.perms.permsTable.find(".choc-service-perms-perm[data-auth='"+Choc.escapeSingleQuote(authority)+"']").length==0) {
                                Choc.Picker.perms.drawPermRow("ALLOWED;" + authority + ";SiteConsumer;DIRECT");
                            }
						}
					}
				});
			};
			this.inherit = function (inherit) {
				var msg = "";
				if(inherit){
					msg += "Sei sicuro di voler abilitare l'ereditarietà dei permessi?"
				} else {
					msg += "Stai per disabilitare l'ereditarietà dei permessi.<br>";
                    msg += "Saranno applicati solo i permessi diretti. Proseguire?";
				}
				Choc.confirm({
					message: msg,
					approve: function () {
						Choc.Docs.inheritPermission(Choc.Picker.perms.noderef, inherit, function(res) {
							if(res.success){
								if(inherit){
									Choc.poptime("Ereditarietà settata con successo");
									Choc.Docs.get(Choc.Picker.perms.noderef, function (node) {
                                        Choc.Picker.perms.drawPermix(node.permissions);
                                    });
								} else {
                                    Choc.poptime("Ereditarietà rimossa con successo");
                                    Choc.Picker.perms.callback(res);
                                    Choc.Picker.perms.destroy();
								}
							}
                        });
                    }
				});
            };
			this.ok = function(){
				var perms = {};
				Choc.Picker.perms.permsTable.find(".choc-service-perms-perm").each(function(){
					var trEl = $(this),
                    	level = trEl.find(".ui.dropdown").dropdown("get value");
					if(level!="-") {
                        perms[trEl.data("auth")] = level;
                    }
				});
				Choc.Docs.permissions(Choc.Picker.perms.noderef, perms, function(res){
					Choc.Picker.perms.callback(res);
					Choc.Picker.perms.destroy();
				});
			};
			this.destroy = function(){
				Choc.Picker.hidePicker(this, "perms");
			};
			// show picker
			Choc.Picker.showPicker(this);
		};

		this.perms = new perms(config, Choc.Picker.createPicker('perms', config));
	},
	// code picker instance
	code: null,
	// when use code picker, you can add a object scope (dropped on picker close)
	codeScope: {},
	// when use code picker, you can add helper function or variables in this object (all dropped on picker close)
	codeFn: {},
	/**
	 * function to open custom picker
	 * config object:
	 * 		header: html code to put in header
	 * 	    template: name of template to load (used for body)
	 * 		body: if you don't use template, you can pass html code to put in body
	 * 		go: function to call on confirm button (you must call "Choc.Picker.code.destroy()" in this function to close picker)
	 * 		gohtml: text to show in confirm button
	 * 		showFooter: boolean to choose if show default footer
	 * 		width: semantic ui class to choose width of picker
	 */
	putCode: function(config){
		// get dom objects
		var code = function(config, DOM){
            $.extend(this, config.picker);
            this.id = 'code';
			this.picker = DOM;
			this.picker.find('.choc-service-code-column').prop("class", (config.width||"nine")+" wide column");
			this.header = this.picker.find(".choc-service-code-header");
			this.body = this.picker.find(".choc-service-code-body");
			this.footer = this.picker.find(".choc-service-code-footer");
			this.confirm = this.picker.find(".choc-service-code-confirm");
			this.confirm.html(config.gohtml || "Conferma");
			this.showFooter = config.showFooter==null ? true : config.showFooter;
			if(this.showFooter){
				this.footer.removeClass("hide");
			} else {
				this.footer.addClass("hide");
			}
			this.callback = config.go || $.noop;
			this.onDestroy = config.onDestroy || $.noop;
			this.header.html(config.header || "");
			if(config.template){
				config.body = Choc._render(Choc.mustache_url+config.template, Choc.Picker.codeScope, Choc.Picker.codeFn);
			}
			this.body.html(config.body || "");
			this.go = function(event){
				Choc.Picker.code.callback(event);
			};
			this.destroy = function(){
				Choc.Picker.codeScope = {};
				Choc.Picker.codeFn = {};
				var onDestroy = Choc.Picker.code.onDestroy;
				Choc.Picker.hidePicker(this, "code");
				onDestroy();
			};
			// show picker
			Choc.Picker.showPicker(this);
		};

		this.code = new code(config, Choc.Picker.createPicker('code', config));
	},
	/** utility function, not picker **/
	tailHidden: [],
	pickerKeyHandler: function(e){
		if(e && e.keyCode == 27 && Choc.Picker.escKeyClose) {
			$(".choc-service:visible").each(function(){
				var pickName = "."+$(this).prop("class").split(" ")[1].replace(".choc-service-", "");
				Choc.Picker.hidePicker($(this), pickName);
			});
		}
		/*else if(e && e.keyCode == 13) { //There is other listener ot this keyCode , could control event parent
			$(".choc-service:visible").each(function(){
				var blueButts = $(this).find(".ui.blue.button")
				if (blueButts.length > 0){
					blueButts[0].click();
				}
			});			
		}*/
	},
	showPicker: function($picker){
	    // add to picker queue
        Choc.Picker.queue.push($picker);
        // hide current picker
		$(".choc-service:visible").each(function(){
			var className = "."+$(this).prop("class").split(" ")[1];
			Choc.Picker.tailHidden.push(className);
			$(document).off("keyup");
		});
		$(".choc-service").hide().width("0px");
        $picker.picker.show().width("100%").height(document.body.scrollHeight);
		$("html, body").animate({ scrollTop: 0 });
		$(document).keyup(Choc.Picker.pickerKeyHandler);

	},
	hidePicker: function($picker, pickerName){
        var removedPicker = Choc.Picker.queue.pop();
        removedPicker.picker.remove();
		Choc.Picker[pickerName] = null;
		for (var i = Choc.Picker.queue.length-1; i >= 0; i--) {
		    if (Choc.Picker.queue[i].id === pickerName) {
                Choc.Picker[pickerName] = Choc.Picker.queue[i];
            }
        }
		$(document).off("keyup");
		if(Choc.Picker.queue.length>0){
			Choc.Picker.queue[Choc.Picker.queue.length-1].picker.show().width("100%");
			$(document).keyup(Choc.Picker.pickerKeyHandler);
		}
	},

    /**
     * Inject picker into services container
     * @param pickerId picker's id
     * @returns {*} dom object of new picker service
     */
    createPicker: function(pickerId, config) {
        var services = $("#choc-services");
        // check if in config there are global props
        config.title = config.title || "";
        // create config object for extend object
		config.picker = {};
        // build html picker
        services.append(Choc._render(Choc.mustache_picker_url + pickerId + '.picker.ejs', config));
        return services.children('.choc-service').last();
    },

	drawUos: function(res, uosContainer, onChange){
        var allUos = [];
        var html = "";
        var drawUo = function(ref){
            var uo = res.uos[ref];
            var currUo = {};
            if(uo) {
                if (!uo.disabled) {
                    currUo.name = uo.name;
                    currUo.id = ref;
                    allUos.push(currUo);
                }
                for (var j = 0; j < uo.children.length; j++) {
                    drawUo(uo.children[j]);
                }
            }
        };

        drawUo(res.root);

        allUos.sort(function(a, b){
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        });

        // ciclare
        allUos.forEach( function (arrayItem){
            html += "<div class='item' data-value='" + arrayItem.id + "' data-text='" + arrayItem.name + "'>" + arrayItem.name + "</div>";
        });
        //$("#choc-uo-select-uos").find(".menu").empty().append(html);

        uosContainer.find(".menu").empty().append(html);
		uosContainer.dropdown({
			onChange: onChange,
			fullTextSearch: true
		});
	}
}
})();
