/**
 * Choc @UI Module
 * @namespace Choc
*/

(function(){
	
/**
 * @UI module (appending to Choc general object)
 */
$.extend(Choc, {
	// get last uplaods
	_lastUploadsFolder: sessionStorage.getItem("desktop-uploads"),
	_lastUploadsLimit: 5,
	_lastUploads: function(){
		if(Choc._lastUploadsFolder){
			var node = Choc.Docs.docs[Choc._lastUploadsFolder];
			if(node){
				Choc.Docs.search({
					rootNode: Choc._lastUploadsFolder,
					limit: Choc._lastUploadsLimit,
					type: "cm:content",
					noaspect: "sys:hidden",
					orderby: "cm:created",
					orderdesc: true
				}, Choc._drawLastUploads);
			} else {
				Choc.Docs.get(Choc._lastUploadsFolder, Choc._lastUploads);
			}
		} else {
			Choc.Docs.getContainer("documentLibrary", function(node){
				Choc._lastUploadsFolder = node.nodeRef;
				Choc._lastUploads();
			});
		}
	},
	_drawLastUploads: function(nodes){
		var ulEl = $("#desktop-uploads"), rootNode = Choc.Docs.docs[Choc._lastUploadsFolder], rootName = rootNode.path;
		if(rootNode.type!="tit:baseFolder"){
			rootName += (rootNode.type!="tit:titolo"?"/":"")+rootNode.properties["cm:name"];
		}
		ulEl.prev().html("in: <i>Titolario"+rootName+"</i>");
		ulEl.html(Choc._render(Choc.mustache_url+"desktop.uploads.ejs", {nodes: nodes}));
	},
	_lastUploadsChooseFolder: function(){
		Choc.Picker.openDoclib({
			multiple: false,
			selectable: function(n){ return n.isContainer && n.type.indexOf("tit")==0; },
			upload: false,
			callback: function(nodes){
				if(nodes.length>0){
					Choc._lastUploadsFolder = nodes[0].noderef;
					sessionStorage.setItem("desktop-uploads", Choc._lastUploadsFolder);
					Choc._lastUploads();
				}
			}
		});
	},
});
	
})();
