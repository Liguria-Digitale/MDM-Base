/**
 * Choc @Docs Module
 * @namespace Choc.Docs
*/
(function(){
	
/**
 * @Docs module
 */
Choc.Docs = {
	// current parent
	currentParent: null,
	// current parent
	currentDoc: null,
	// current path node
	currentPN: null,
	// current page
	currentPage: 0,
	// current search page
	currentSearchPage: 0,
	// multiple selection
	multipleSelection: [],
	// root noderef for this view
	root: null,
	rootName: null,
	mode: null,
	// list of docs yet retrieved
	docs: {},
	// fascicoli sort item
	titSortField: "cm:name",
	// fascicoli sort desc
	titSortDesc: "false",
	// fascicoli elements number
	titElements: null,
	// function to get node detail
	get: function(noderef, callback, el){
		$.getJSON(Choc.doclib2_url+"node/"+noderef.replace(":/",""), function(res){
			var item = res.item.node;
			item.path = res.item.location.path;
			if(res.item.parent){
				var parent = res.item.parent;
				item.parent = parent.nodeRef;
				if(parent.aspects.indexOf("st:siteContainer")>-1){
					parent.properties["cm:name"] = Choc.Docs.rootName;
				}
				if(Choc.Docs.docs[parent.nodeRef]){
					parent.parent = Choc.Docs.docs[parent.nodeRef].parent; 
				}
				Choc.Docs.docs[parent.nodeRef] = parent;
			}
			if(item.aspects.indexOf("st:siteContainer")>-1){
				if (item.type == "org:nodeUo"){
					item.properties["cm:name"] = parent.properties["cm:title"] || "Archivio";
				}
				else{
					item.properties["cm:name"] = Choc.Docs.rootName || "Archivio";
				}
			}
			Choc.Docs.docs[noderef] = item;
			callback(item, el);
		});
	},
	node: function(noderef, callback){
		$.getJSON(Choc.alf_url+"slingshot/node/"+noderef.replace(":/",""), callback);
	},
	
	//function to get preferences
	getPreferences: function(callback){
		$.getJSON(Choc.alf_url+"/api/people/"+Choc.user.id+"/preferences", function(res){
			// call callback
			callback(res);
		});
	},
	
	setPreferences: function(pref, callback){
		$.ajax({
            url: Choc.alf_url+"/api/people/"+Choc.user.id+"/preferences",
            method: "POST",
            data: JSON.stringify(pref),
            contentType: "application/json; charset=UTF-8",
            success: function(){
	            callback(true, pref);
	        },
            error: function(){
                callback(false);
            }
        });
	},
	// function to get children
	children: function(noderef, callback, pattern){
		// getPreferences update titSortDesc and titSortField variables
		var url = Choc.choc_url+"reg/tit/list?noderef="+noderef+"&page="+Choc.Docs.currentPage+"&orderDesc="+Choc.Docs.titSortDesc+"&orderBy="+Choc.Docs.titSortField;
		if (Choc.Docs.titElements){
			url += "&elements="+Choc.Docs.titElements;
		}
		if(pattern){
            url += "&pattern="+pattern;
		}
		$.getJSON(url, function(res){
			// build all nodes
			var nodes = {},
			    totalElements = res.totalElements
			for(var i in res.items){
				var item = res.items[i].node;
				item.parent = noderef;
				item.path = res.items[i].path; 
				nodes[item.nodeRef] = item;
				Choc.Docs.docs[item.nodeRef] = item;
				Choc.Docs.currentPN = res.items[i].fullPath;
			}
			// call callback
			callback(nodes, totalElements);
		});				
	},
	// function to get parents
	parents: function(noderef, callback){
		$.getJSON(Choc.choc_url+"reg/tit/parents?noderef="+noderef, function(res){
			// build all nodes
			var nodes = {}
			for(var i in res.items){
				var item = res.items[i];
				item.parent = noderef;
				item.path = res.items[i].path; 
				nodes[item.nodeRef] = item;
				Choc.Docs.docs[item.nodeRef] = item;
			}
			// call callback
			callback(nodes);
		});
	},
	// function to get container
	getContainer: function(name, callback){
		$.getJSON(Choc.doclib_url+"container/"+Choc.site+"/"+name, function(res){
			Choc.Docs.get(res.container.nodeRef, callback);
		});
	},
	// function to get user home for this site
	getUserHome: function(callback){
		$.getJSON(Choc.choc_url+"org/users/home?site="+Choc.site, function(res){
			Choc.user.noderef = res.userref;
			Choc.Docs.get(res.home, callback);
		});
	},
	// function for search in current root
	search: function(data, callback){
		if(!data.rootNode) {
			data.rootNode = Choc.Docs.currentParent || Choc.Docs.root;
		}
		if(!data.page) {
            data.page = Choc.Docs.currentSearchPage;
        }
		$.ajax({
		    type: "POST",
		    url: Choc.choc_url+"reg/tit/search",
		    data: JSON.stringify(data),
		    success: function(res){
		    	// build all nodes
				var nodes = {}
				for(var i in res.items){
					var item = res.items[i].node;
					item.parent = Choc.Docs.docs[item.nodeRef] ? Choc.Docs.docs[item.nodeRef].parent : null;
					item.path = res.items[i].path;
					nodes[item.nodeRef] = item;
					Choc.Docs.docs[item.nodeRef] = item;
				}
				// call callback
				callback(nodes, res.total);
		    },
		    contentType: "application/json; charset=UTF-8",
		    dataType: 'json'
		});
	},
	// function to copy node
	copy: function(noderefs, destination, callback){
		$.ajax({
		    type: "POST",
		    url: Choc.alf_url+"slingshot/doclib/action/copy-to/node/"+destination.replace(":/",""),
		    data: JSON.stringify({nodeRefs: noderefs}),
		    success: function(res){
		    	callback({
					success: res.overallSuccess,
					results: res.results
				});
		    },
		    contentType: "application/json",
		    dataType: 'json'
		});
	},
	// function to copy node
	move: function(noderefs, destination, callback){
		$.ajax({
		    type: "POST",
		    url: Choc.alf_url+"slingshot/doclib/action/move-to/node/"+destination.replace(":/",""),
		    data: JSON.stringify({nodeRefs: noderefs}),
		    success: function(res){
		    	callback(res.overallSuccess);
		    },
		    contentType: "application/json",
		    dataType: 'json'
		});
	},
	// save doc
	save: function(config){
		var data = {}
		data.noderef = config.noderef;
		data.pdf = config.pdf==null ? false : config.pdf;
		data.type = config.type||"txt";
		data.text = config.text;
		$.ajax({
		    type: "POST",
		    url: Choc.choc_url+"reg/util/editorsave",
		    data: JSON.stringify(data),
		    success: function(res){
		    	config.callback(res);
		    },
		    error: function(){
		    	config.callback({success:false});
		    },
		    contentType: "application/json; charset=UTF-8",
		    dataType: 'json'
		});
	},
	// function to send creation or editing data for a node
	post: function(data, callback){
		var postData = {};
		$.each(data, function(prop, value){
			postData[prop.replace("_",":")] = $.trim(value);
		});
		$.ajax({
			type: "POST",
			url: Choc.choc_url+"picker/form",
			data: JSON.stringify(postData),
			contentType: "application/json; charset=UTF-8",
			datatype: "json",
			success: callback || $.noop,
			error: function(){
				callback({success: false});
			}
		});
	},
	/**
	 * send permissions for a node
	 */
	permissions: function(noderef, perms, callback){
		$.ajax({
		    type: "POST",
		    url: Choc.choc_url+"reg/tit/perms",
		    data: JSON.stringify({
		    	noderef: noderef,
		    	perms: perms
		    }),
		    success: callback,
		    error: function(){
		    	callback({success:false});
		    },
		    contentType: "application/json; charset=UTF-8",
		    dataType: 'json'
		});
	},
	inheritPermission: function (noderef, inherit, callback) {
        $.getJSON(Choc.choc_url+"reg/tit/inheritPerms?noderef="+noderef+"&inherit="+inherit, callback);
    },
	/**
	 * return true if i have permissions on node, false otherwise
	 */
	haveWritePermission: function(node){
		return node.permissions.user.Write && node.permissions.user.Delete;
	},
	/**
	 * return true if i have permissions manage on node, false otherwise
	 */
	haveManagePermission: function(node){
        return node.permissions.user.Write && !node.permissions.user.Delete;
	},
	/**
	 * add or remove aspects
	 * @noderef noderef of node
	 * @toadd array of aspects to add
	 * @toremove array of aspects to remove
	 * @callback
	 */
	aspects: function(noderef, toadd, toremove, callback){
		$.ajax({
		    type: "POST",
		    url: Choc.alf_url+"slingshot/doclib/action/aspects/node/"+noderef.replace(":/",""),
		    data: JSON.stringify({
		    	added: toadd || [],
		    	removed: toremove || []
		    }),
		    success: callback,
		    contentType: "application/json",
		    dataType: 'json'
		});
	},
	specializeType: function(noderef, type, callback){
		$.ajax({
		    type: "POST",
		    url: Choc.alf_url+"slingshot/doclib/type/node/"+noderef.replace(":/",""),
		    data: JSON.stringify({
		    	type: type
		    }),
		    success: callback,
		    contentType: "application/json",
		    dataType: 'json'
		});
	},
	// get versions of docs
	versions: function(noderef, callback){
		$.getJSON(Choc.alf_url+"api/version?nodeRef="+noderef, callback);
	},
	/**
		@nodeRef noderef of node
		@version version to revert
		@description comment for revert
		@majorVersion boolean to choose if new version is minor or major
	 */
	revert: function(config){
		$.ajax({
			type: "POST",
			url: Choc.alf_url+"api/revert",
			data: JSON.stringify({
				nodeRef: config.noderef,
				version: config.version,
				majorVersion: config.major==null ? true : config.major,
				description: config.comment || ""
			}),
			success: config.callback,
			contentType: "application/json",
			dataType: 'json'
		});
	},
	// start import of docs
	importDocs: function(noderef, path, callback){
		$.ajax({
			type: "POST",
			url: Choc.choc_url+"import",
			data: JSON.stringify({
				path: path,
				noderef: noderef
			}),
			contentType: "application/json",
			success: callback,
			error: callback
		});
	},
	// icon html
	icon: function(name){
		return "<i class='"+Choc.Docs.iconCssClass(name)+"'></i>";
	},
	// icon css class
	iconCssClass: function(name){
		if(name.indexOf(".")>-1){
			var ext = name.substring(name.lastIndexOf(".")+1).toLowerCase();
			if(ext=="pdf"){
				return "icon file pdf outline";
			} else if(ext=="png" || ext=="jpg" || ext=="jpeg" || ext=="gif" || ext=="tif" || ext=="tiff" || ext=="bmp"){
				return "icon file image outline";
			} else if(ext=="txt"){
				return "icon file text outline";
			} else if(ext=="xml"){
				return "icon file excel outline";
			} else if(ext=="zip"){
				return "icon file archive outline";
			} else if(ext=="eml" || ext=="msg"){
				return "icon mail outline";
			} else {
				return "icon file outline";
			}
		} else {
			return "icon file outline";
		}
	},
	getAssociations: function(noderef, assocName, callback){
		var uri = Choc.choc_url+"picker/getassociations?noderef="+noderef;
		if (assocName){
			uri += "&assocname=" + assocName;
		}
		$.getJSON(uri, callback);
	},
	// add assoc
	addAssoc: function(nodeToAss, node, assocname, callback){
		$.getJSON(Choc.choc_url+"addassociation?nodetoassoc="+nodeToAss+"&node="+node+"&nameassoc="+assocname, callback);
	},
	// utility to calculate roman number automatically
	setRomanNumberField: function(){
		Choc.Picker.form.form.find(".ui.form").form("set value", "tit_titoloNumeroRomano", Choc.intToRoman($(this).find("input").val()));
	},
	// utility for get display name for a type
	displayName: function(node){
		return node.properties["cm:name"];
	},
	// object for actions
	Actions: {
		/**
		 * Actions for DOCUMENTS
		 */
		// delete document (or generic folder)
		deleteNode: function(noderef, callback){
			var doc = Choc.Docs.docs[noderef];
			$.ajax({
				url: Choc.alf_url+"slingshot/doclib/action/file/node/"+noderef.replace(":/",""),
				type: "DELETE",
				success: function(res){
					if(res.overallSuccess){
						callback(true);
					} else {
						callback(false);
					}
				}
			});
		},
		// download action
		download: function(noderef){
			if(Choc.Docs.docs[noderef]){
				var rend = [], name, uri;
				var mime = Choc.Docs.docs[noderef].mimetype;
				if(mime == "application/pdf" && noderef.indexOf("workspace")==0){
					Choc.Docs.children(noderef, function(nodes){
						if(nodes){
							for(var i in nodes){
								var node = nodes[i];
								if(!node.isContainer){
									if(node.aspects.indexOf["rn:hiddenRendition"] != -1 && node.type == "cm:content"){
										rend.push(node.nodeRef);																		
									}
								}
							}
						}else{
							rend.push(noderef);
						}
						if(rend.length>0){
							name = encodeURIComponent(Choc.Docs.docs[rend[0]].properties["cm:name"]);
							uri = Choc.alf_url+"api/node/content/"+rend[0].replace(":/","")+"/"+name+"?a=true";
							window.open(uri, "_blank");
						}else{
							name = encodeURIComponent(Choc.Docs.docs[noderef].properties["cm:name"]);
							uri = Choc.alf_url+"api/node/content/"+noderef.replace(":/","")+"/"+name+"?a=true";
							window.open(uri, "_blank");
						}
					});										
				}else{
					name = encodeURIComponent(Choc.Docs.docs[noderef].properties["cm:name"]);
					uri = Choc.alf_url+"api/node/content/"+noderef.replace(":/","")+"/"+name+"?a=true";
					window.open(uri, "_blank");
				}								
			}else{
				Choc.Docs.get(noderef, function(){
                    Choc.Actions.runAction('download', noderef);
				});
			}
		},
		// download as zip action
		downloadZip: function(noderefs, zipname){
			var statusCallback = function(zip){
				var uri = Choc.alf_url+"api/internal/downloads/"+zip.replace(":/","")+"/status";
				$.getJSON(uri, function(res){
					if(res.status=="DONE"){
						if(zipname==null){
							zipname = encodeURIComponent(Choc.Docs.docs[noderefs[0]].properties["cm:name"] + ".zip");
						}
						window.open(Choc.alf_url+"api/node/content/"+zip.replace(":/","")+"/"+zipname+"?a","_blank");
						$.ajax({
						    type: "DELETE",
						    url: Choc.alf_url+"api/internal/downloads/"+zip.replace(":/",""),
						    contentType: "application/json",
						    dataType: 'json'
						});
					} else if(res.status=="PENDING" || res.status=="IN_PROGRESS"){
						setTimeout(function(){
							statusCallback(zip);
						}, 100);
					} else {
						Choc.alert("Errore durante il download dell'email!","danger");
					}
				});
			}, data = [];
			$.each(noderefs, function(index, value){
				data.push({
					nodeRef: value
				});
			});
			$.ajax({
			    type: "POST",
			    url: Choc.alf_url+"api/internal/downloads",
			    data: JSON.stringify(data),
			    success: function(res){
			    	statusCallback(res.nodeRef);
			    },
			    contentType: "application/json",
			    dataType: 'json'
			});
		},
        browserView: function (noderef) {
            if(Choc.Docs.docs[noderef]){
				var name = encodeURIComponent(Choc.Docs.docs[noderef].properties["cm:name"]),
					uri = Choc.alf_url+"api/node/content/"+noderef.replace(":/","")+"/"+name;
				window.open(uri, "_blank");
            }else{
                Choc.Docs.get(noderef, function(){
                    Choc.Docs.Actions.browserView(noderef);
                });
            }
        },
		// get content action, to use only for plain content types (txt,html,xml)
		content: function(noderef, callback){
			$.ajax({
				url: Choc.alf_url+"/api/node/content/"+noderef.replace(":/",""),
				dataType: "text",
				success: function(data){
					callback(data);
				} 
			});
		},
		ocr: function(noderef, parent, callback){
			$.getJSON(Choc.choc_url+"scan/ocr?lang=ita&noderef="+noderef+"&parent"+parent, callback).fail(function(){
				callback({success:false});
			});
		},
		// print preview action
		print: function(noderef){
			if(noderef){
				var pwin = window.open(Choc.choc_url+"picker/preview?noderef="+noderef);
				setTimeout(function(){
					pwin.window.print();
				}, 2000);
			}
		},
		checkout: function(noderef, callback){
			$.ajax({
				type: "POST",
				url: Choc.alf_url+"slingshot/doclib/action/checkout/node/"+noderef.replace(":/", ""),
				data: "{}",
				success: callback,
				contentType: "application/json",
				dataType: 'json'
			});
		},
		checkoutCancel: function(noderef, callback){
			$.ajax({
				type: "POST",
				url: Choc.alf_url+"slingshot/doclib/action/cancel-checkout/node/"+noderef.replace(":/", ""),
				data: "{}",
				success: callback,
				contentType: "application/json",
				dataType: 'json'
			});
		},
		/**
		 * Actions for FOLDER
		 */
		// actions for change fascicolo state
		changeFascicoloState: function(noderef, callback){
			$.getJSON(Choc.choc_url+"reg/util/fascicoloState?noderef="+noderef, function(res){
				Choc.Docs.get(noderef, function(node){
					res.state = node.properties["tit:fascicoloStato"];
					callback(res);
				});
			});
		},
		// delete titolario folder
		deleteTitolarioFolder: function(noderef, callback){
			Choc.Docs.aspects(noderef, ["sys:hidden"], [], function(res){
				var node = Choc.Docs.docs[noderef];
				Choc.insertAudit({
					noderef: noderef,
					type: Choc.auditsConst.tit,
					action: "Storicizzazione voce di titolario",
					params: {
						"Tipo Voce": node.type.split(":")[1],
						"Nome": node.properties["cm:name"],
						"Data di storicizzazione": Choc.formatIsoDate({iso8601: moment().toISOString()})
					}
				});
				callback({
					success: res.overallSuccess
				});
			});
		}
	}
};
	
})();
