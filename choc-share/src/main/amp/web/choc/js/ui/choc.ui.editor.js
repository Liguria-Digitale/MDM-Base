/**
 * Choc @UI Module
 * @namespace Choc
*/

(function(){
	
/**
 * @UI module (appending to Choc general object)
 */
$.extend(Choc, {
	// editor parent (create mode)
	_editorParent: null,
	// editor node (edit mode)
	_editorNode: null,
	// editor mode from
	_editorMode: null,
	// build textarea
	_buildEditor: function(withHtml, editMode){
		var tarea = $("#editor-area");
		if(withHtml){
			$("#editor-onlytext").removeClass("hide");
			$("#editor-html").addClass("hide");
			tarea.tinymce({
				theme:"modern",
				width:"100%",
				language: "it",
			    plugins: [
			        "advlist autolink lists link image charmap print preview hr anchor pagebreak",
			        "searchreplace wordcount visualblocks visualchars code",
			        "insertdatetime media nonbreaking save table contextmenu directionality",
			        "emoticons paste textcolor colorpicker textpattern"
			    ],
			    toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
			    toolbar2: "print preview media | forecolor backcolor emoticons",
			    image_advtab: true,
                convert_urls: false
			});
		} else {
			$("#editor-onlytext").addClass("hide");
			$("#editor-html").removeClass("hide");
			var tiny = tarea.tinymce();
			if(tiny){
				tiny.destroy();
			}
		}
		// se sto in edit mode, carico il contenuto attuale
		if(editMode){
			Choc.Docs.Actions.content(Choc._editorNode, function(text){
				tarea.tinymce()==null ? tarea.val(text) : tarea.html(text);
			});
		}
	},
	// setup exit button
	_setupExit: function(){
		Choc.confirm({
			message: "<b>Sei sicuro? Le modifiche non salvate andranno perse!</b><br/>",
			approve: function(){
				history.back();
			}
		});
	},
	// save text
	_saveFile: function(pdf){
		var tarea = $("#editor-area");
		var text = tarea.tinymce()==null ? tarea.val() : tarea.html();
		var type = tarea.tinymce()==null ? "txt" : "html";
		Choc.Docs.save({
			noderef: Choc._editorParent || Choc._editorNode,
			text: text,
			type: type,
			pdf: pdf,
			callback: function(res){
				if(res.success){
					var mode = Choc._editorMode=="doclib" ? null : Choc._editorMode;
					location.href = "titolario?noderef=" + (Choc._editorParent || Choc._editorNode) + (mode==null ? "" : "&"+mode);
				} else {
					Choc.alert("Impossibile salvare il documento!","danger");
				}
			}
		})
	},
	_getCaption: function(){
		var el = $("#dynamic-caption-list").parent().parent();
		if (el.hasClass("hide")){
			el.removeClass("hide");
		}
		else{
			el.addClass("hide");
		}
	}
});
	
})();
