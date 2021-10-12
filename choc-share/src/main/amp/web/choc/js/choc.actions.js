/**
 * Choc @Mdoc Module
 * @namespace Choc
 */

(function(){

    /**
     * Choc modules
     * @Actions module
     */
    Choc.Actions = {
        // get action by id
        getAction: function (id) {
            return Choc.Actions.actions[id];
        },
        // get node object from various module, if exists
        getNode: function (noderef) {
            // cerca negli elenchi di nodi dei vari moduli
            return Choc.Docs.docs[noderef];
        },
        // run single action without check
        runAction: function (id, noderef, params, callback) {
            var action = Choc.Actions.actions[id],
                node = Choc.Actions.getNode(noderef);
            if(node) {
                action.execute(node, params, callback || action.callback || $.noop);
            } else {
                Choc.Docs.get(noderef, function () {
                    Choc.Actions.runAction(id, noderef, params, callback);
                });
            }
        },
        // actions definition
        actions: {
            // download action for a node or a custom rendition
            "download": {
                id: "download",
                label: "Download",
                icon: "download",
                priority: 3,
                modules: [],
                check: function (node) {
                    return !node.isContainer;
                },
                execute: function (node, params, callback) {
                    var rend = [], mime = node.mimetype;
                    if(mime == "application/pdf"){
                        var me = this;
                        Choc.Docs.children(node.nodeRef, function(nodes){
                            if(nodes){
                                for(var i in nodes){
                                    var cnode = nodes[i];
                                    if(!cnode.isContainer){
                                        if(cnode.aspects.indexOf["rn:hiddenRendition"] != -1 && cnode.type == "cm:content"){
                                            rend.push(cnode.nodeRef);
                                        }
                                    }
                                }
                            } else {
                                rend.push(node.nodeRef);
                            }
                            if(rend.length>0){
                                me.download(Choc.Actions.getNode(rend[0]), callback);
                            } else {
                                me.download(node, callback);
                            }
                        });
                    } else {
                        this.download(node, callback);
                    }
                },
                download: function (node, callback) {
                    var name = encodeURIComponent(node.properties["cm:name"]),
                        uri = Choc.alf_url+"api/node/content/"+node.nodeRef.replace(":/","")+"/"+name+"?a=true";
                    callback({success: true});
                    window.open(uri, "_blank");
                }
            },
            "load-version": {
                id: "load-version",
                icon: "upload",
                label: "Carica nuova versione",
                modules: ["doclib", "mdoc"],
                showVersionNumber: true, // default choose
                priority: 9,
                check: function (node, params) {
                    return false; // override if necessary
                },
                execute: function (node, config, callback) {
                    var executeScope = this,
                        html = "<form class='ui form' action='"+Choc.alf_url+"api/upload' method='post' enctype='multipart/form-data'>";
                    html += "<div class='field'><label>Scegli file</label><input type='file' name='filedata' class='ui button' /></div>";
                    html += "<div class='field'><label>Commento versione</label><input type='text' name='description' /></div>";
                    if(this.showVersionNumber) {
                        html += "<div class='grouped fields'><label>Versione:</label>";
                        html += "<div class='field'><div class='ui radio checkbox checked'>";
                        html += "<input type='radio' name='majorVersion' value='false' checked='checked'><label>Minor</label></div></div>";
                        html += "<div class='field'><div class='ui radio checkbox'>";
                        html += "<input type='radio' name='majorVersion' value='true'><label>Major</label></div></div>";
                        html += "</div>"; // close grouped fields
                    } else {
                        html += "<input type='hidden' name='majorVersion' value='false' />";
                    }
                    html += "<input type='hidden' name='overwrite' value='true' />";
                    html += "<input type='hidden' name='updateNodeRef' value='"+node.nodeRef+"' /></form>";
                    // carico prompt per il caricamento della nuova versione
                    Choc.Picker.putCode({
                        header: "Carica nuova versione",
                        body: html,
                        go: function(){
                            var formEl = Choc.Picker.code.body.find('form.ui.form');
                            if(formEl.find("input[type='file']").val()){
                                formEl.submit();
                            } else {
                                Choc.poptime("Non hai selezionato il file", "warning");
                            }
                        }
                    });
                    Choc.Picker.code.body.find('form.ui.form .ui.checkbox').checkbox();
                    // imposto funzione da eseguire al submit
                    Choc.Picker.code.body.find('form.ui.form').submit(function(){
                        var versionComment = Choc.Picker.code.body.find('form.ui.form').form("get value", "description"),
                            nodeToAudit = node.nodeRef;
                        if(Choc.Actions.getNode(nodeToAudit).aspects.indexOf("cm:workingcopy")>-1){
                            var formScope = this;
                            Choc.Docs.getAssociations(node.nodeRef, "cm:original", function(assocs) {
                                for (var origRef in assocs.items["cm:original"].elements) {
                                    nodeToAudit = origRef;
                                }
                                executeScope.internalSubmit.call(formScope, nodeToAudit, versionComment, callback);
                            });
                        } else {
                            executeScope.internalSubmit.call(this, nodeToAudit, versionComment, callback);
                        }
                        return false;
                    });
                },
                internalSubmit: function (nodeToAudit, versionComment, callback) {
                    $(this).ajaxSubmit({
                        success: function(){
                            Choc.Docs.get(nodeToAudit, function(versionItem){
                                Choc.insertAudit({
                                    type: Choc.auditsConst.document,
                                    action: "Caricamento nuova versione",
                                    noderef: versionItem.nodeRef,
                                    params: {
                                        "Numero Versione": versionItem.properties["cm:versionLabel"],
                                        "Commento": versionComment
                                    }
                                });
                            });
                            Choc.poptime("Nuova versione caricata con successo!");
                            Choc.Picker.code.destroy();
                            callback();
                        }
                    });
                },
                callback: function () {
                    if(Choc.page=="managedoc"){
                        Choc._drawDocs();
                    }
                }
            }
        }
    }

})();
