<div class="choc-container choc-${page.id}" data-title="Editor Documenti">
	<div class="ui centered grid">
		<div class="twelve wide column">
			<div class="ui secondary menu">
				<div class="ui compact button hide" id="editor-onlytext" onclick="Choc._buildEditor(false);">Editor solo testo</div>
				<div class="ui compact button hide" id="editor-html" onclick="Choc._buildEditor(true);">Editor HTML</div>
				<div class="ui compact blue button" onclick="Choc._saveFile(false);">Salva in txt/html</div>
				<div class="ui compact blue button" onclick="Choc._saveFile(true);">Salva in PDF</div>
				<div class="ui compact red button" onclick="Choc._setupExit();">Esci</div>
			</div>
			<textarea rows="30" cols="130" id="editor-area"></textarea>
		</div>
	</div>
</div>
<script type="text/javascript">
$(document).ready(function(){
	Choc._editorMode = "${page.url.args.mode!"user"}";
	var parent = "${page.url.args.parent!""}";
	if(parent!=""){
		// sto creando un nuovo file, di default attivo html
		Choc._editorParent = parent;
		Choc._buildEditor(true, false);
	} else {
		var noderef = "${page.url.args.noderef!""}";
		if(noderef!=""){
			var mime = "${page.url.args.mime!"txt"}";
			// sto editando un file, controllo mimetype per capire se attivare html
			Choc._editorNode = noderef;
			if(mime=="html"){
				Choc._buildEditor(true, true);
			} else {
				Choc._buildEditor(false, true);
			}
			$("#editor-onlytext").addClass("hide");
			$("#editor-html").addClass("hide");
		} else {
			location.href = "desktop";
		}
	}
});
</script>
