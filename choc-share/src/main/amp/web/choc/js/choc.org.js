/**
 * Choc @Org Module
 * @namespace Choc.Org
*/

(function(){
	
/**
 * @Org module
 */
Choc.Org = {
	/**
	 * AOO SECTION
	 */
	// list of offices
	aoos: null,
	// get account list
	getAoos: function(callback){
		$.getJSON(Choc.choc_url+"sites?spf=choc-site", function(res){
			Choc.Org.aoos = res;
			callback(res);
		});
	},
	createAoo: function(name, prefix, callback){
		$.getJSON(location.context+"/page/choc/aoocreate?name="+name+"&prefix="+prefix, callback).fail(function(){callback({success:false})});
	},
	deleteAoo: function(name, callback){
        $.getJSON(Choc.choc_url+"org/aoo/delete?name="+name).done(function () {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                url: location.context+"/service/modules/delete-site",
                data: JSON.stringify({
                    shortName: name
                }),
                success: function(res){
                	callback(res.success);
                }
            });
        }).fail(function(){callback(false)});
	},
	/**
	 * UO SECTION
	 */
	// list of uos
	rootUo: null,
	uos: null,
    uoGroups: null,
	// get uo by noderef
	getUo: function(noderef){
		return this.uos ? this.uos[noderef] : null;
	},
	// get uos list
	getUos: function(callback){
		$.getJSON(Choc.choc_url+"org/uo/list?site="+Choc.site, function(res){
            Choc.Org.uos = res.uos;
            Choc.Org.uoGroups = res.groups;
            Choc.Org.rootUo = res.root;
            callback(res);
        });
    },
	// create uo
	createUo: function(name, parent, callback){
		$.getJSON(Choc.choc_url+"org/uo/create?parent="+parent+"&name="+encodeURIComponent(name), callback);
	},
	// create uo
	removeUo: function(uo, callback){
		$.getJSON(Choc.choc_url+"org/uo/delete?uo="+uo, callback);
	},
	// create uo
	moveUo: function(uo, parent, callback){
		if(uo==parent){
			return;
		}
		$.getJSON(Choc.choc_url+"org/uo/move?uo="+uo+"&parent="+parent, callback);
	},
	// add user to uo
	addUserToUo: function(user, uo, callback){
		$.getJSON(Choc.choc_url+"org/uo/adduser?user="+user+"&uo="+uo, callback);
	},
	// remove user from uo
	removeUserFromUo: function(user, uo, callback){
		$.getJSON(Choc.choc_url+"org/uo/removeuser?user="+user+"&uo="+uo, callback);
	},
	// disable uo
	disableUo: function(uo, disable, callback){
		$.getJSON(Choc.choc_url+"org/uo/disable?uo="+uo+"&disable="+disable, callback);
	},
	
	/**
	 * USER SECTION
	 */
	lastSearch: null,
	// get user
	getUser: function(username, callback){
		$.getJSON(Choc.alf_url+"api/people/"+username, callback);
	},
	// get list of user (onlyMember - search only in members group, withUo - return user uo)
	searchUsers: function(query, onlyMember, withUo, maxItems, callback){
		var uri = Choc.choc_url+"org/users/search?q="+query+"&max="+(maxItems || 10);
		if(onlyMember){
			uri += "&site="+Choc.site;
		}
		$.getJSON(uri+"&uo="+withUo,function(res){
			Choc.Org.lastSearch = res.users;
			callback(res.users);
		});
	},
	// create alfresco user
	createUser: function(params, callback){
		$.ajax({
		    type: "POST",
		    url: Choc.choc_url+"org/users/create",
		    data: JSON.stringify(params),
		    success: callback,
		    contentType: "application/json; charset=UTF-8",
		    dataType: "json"
		});
	},
	editUser: function(username, props, callback){
		$.ajax({
			type: "PUT",
		    url: Choc.alf_url+"api/people/"+username,
		    data: JSON.stringify({
		    	firstName: props.name,
		    	lastName: props.surname,
		    	email: props.email
		    }),
		    success: function(){
		    	callback(true);
		    },
		    contentType: "application/json",
		    dataType: "json"
		});
	},
	// delete alfresco user
	deleteUser: function(username, callback){
		$.ajax({
		    type: "DELETE",
		    url: Choc.alf_url+"api/people/"+username,
		    success: callback,
		    contentType: "application/json",
		    dataType: "json"
		});
	},
	// set user password
	setUserPassword: function(username, oldpw, newpw, callback){
		var data = {
			"newpw": newpw
		}
		if(oldpw!=null){
			data["oldpw"] = oldpw;
		}
		$.ajax({
			type: "POST",
		    url: Choc.alf_url+"api/person/changepassword/"+username,
		    data: JSON.stringify(data),
		    success: callback,
		    contentType: "application/json",
		    dataType: "json"
		});
	},
    getUoFromGroup: function(groupName){
        if(Choc.Org.uos){
            for(var u in Choc.Org.uos){
                var uo = Choc.Org.uos[u];
                if(uo.group==groupName){
                    return uo;
                }
            }
            return null;
        } else {
            return null;
        }
    },
	viewUsesrOfUo: function(uoNodeRef){
    	if(Choc.Org.uos) {
            var uo = Choc.Org.getUo(uoNodeRef);
            if (uo.users.length == 0) {
                Choc.poptime("Nessun utente nella UO selezionate", "warning");
            } else {
                var html = "<div class='ui small header'>Utenti UO " + uo.name + "</div><ul class='ui list'>";
                for (var us in uo.users) {
                    html += "<li>" + uo.users[us].name + " (" + uo.users[us].username + ")</li>";
                }
                html += "</ul>";
                Choc.confirm({
                    hideButtons: true,
                    message: html
                });
            }
        } else {
    		Choc.Org.getUos(function () {
				Choc.Org.viewUsesrOfUo(uoNodeRef);
            });
		}
	},
    Chart: function (options) {

        // configuration
        config = {
            childrenKey: 'nodes',
            hidden: function(node) {
                return false;
            },
            disabled: function(node) {
                return false;
            }
        };
        $.extend(config, options);
        this.config = config;

        // TODO rendering del tree dei primi 2 livelli
        var me = this, container = $(this.config.container), nodes = Choc.Org.uos;
        container.empty();
        container.html("<div class='ui tree-picker treeContainer'><div class='content'><div class='tree-tab'></div></div></div>");
        treeContainer = $('.treeContainer', container);
        tree = $('.tree-tab', treeContainer);

        getLeaf = function(id){
            var node = {};
			node.id = id;
			node.name = nodes[id].name;
			node.nodes = [];
			return node;
        }

        getChildrenOfNode = function(node){
            if (!nodes[node].disabled) {
                var currNode = {};
                if (nodes[node].children.length > 0) {
                    currNode.id = node;
                    currNode.name = nodes[node].name;
                    currNode.nodes = [];
                    for (var i = 0; i < nodes[node].children.length; i++) {
                        // se non si tratta di un gruppo
                        if (!Choc.Org.uoGroups[nodes[node].children[i]]) {
                            var _node = getChildrenOfNode(nodes[node].children[i]);
                            if (_node != -1) {  // se è una UO disabled allora non la inserisco
                                currNode.nodes.push(_node);
                            }
                        }
                    }
                } else {
                    currNode = getLeaf(node);
                }
                return currNode;
            }
            return -1;
        };

        initializeNodes = function(nodes) {
            var treehtml;
            treehtml = renderTree(nodes);
            tree.html(treehtml);
            return initializeNodeList(tree);
        };


        showTree = function() {
            tree.show();
            return treeContainer.attr('data-mode', 'tree');
        };
        renderTree = function(nodes) {
            var i, len, node, nodeElement, tree;
            tree = $('<div class="ui tree-picker tree"></div>');
            for (i = 0, len = nodes.length; i < len; i++) {
                node = nodes[i];
                if (config.hidden(node)) {
                    continue;
                }
                nodeElement = $("<div class=\"node\" data-id=\"" + node.id + "\" data-name=\"" + node.name + "\">\n  <div class=\"head\">\n    <i class=\"add circle icon\"></i>\n    <i class=\"minus circle icon\"></i>\n    <i class=\"radio icon\"></i>\n    <a class=\"name\">" + node.name + "</a>\n<a title='Vedi utenti' onclick='Choc.Org.viewUsesrOfUo(\""+ node.id+"\")' style='margin-left:0.5em;'><i class='icon tiny users'></i></a>\n </div>\n  <div class=\"content\"></div>\n</div>").appendTo(tree);
                if (config.disabled(node)) {
                    nodeElement.addClass('disabled');
                }
                if (node[config.childrenKey] && node[config.childrenKey].length) {
                    $('.content', nodeElement).append(renderTree(node[config.childrenKey]));
                } else {
                    nodeElement.addClass("childless");
                }
            }
            return tree;
        };

        initializeNodeList = function(tree) {
            return $('.node', tree).each(function() {
                var content, head, node;
                node = $(this);
                head = $('>.head', node);
                content = $('>.content', node);
                $('>.name', head).on('click', function(e) {
                    return nodeClicked(node);
                });
                if (!node.hasClass('childless')) {
                    $('>.icon', head).on('click', function(e) {
                        node.toggleClass('opened');
                        return content.slideToggle();
                    });
                }
            });
        };

        nodeClicked = function(node) {
        	var noderef = node.data("id");
            me.config.select(noderef);
        };

        recursiveNodeSearch = function(nodes, comparator) {
            var i, len, node, results;
            results = [];
            for (i = 0, len = nodes.length; i < len; i++) {
                node = nodes[i];
                if (comparator(node)) {
                    results.push({
                        id: node.id,
                        name: node.name
                    });
                }
                if (node[config.childrenKey] && node[config.childrenKey].length) {
                    results = results.concat(recursiveNodeSearch(node[config.childrenKey], comparator));
                }
            }
            return results;
        };

        expandLevel = function(level) {
            $('.node', '.treeContainer').each(function(i){
                var l = $(this).parents('.node', '.treeContainer');
                if (l.length < level) {
                    $(this).find('.head > .circle').first().click();
                }
            });
        }

        // popolo la variabile del tree
        initializeNodes([getChildrenOfNode(Choc.Org.rootUo)]);
        expandLevel(1);
        return this;
    }
}
	
})();
