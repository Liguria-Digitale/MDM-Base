<div class="choc-container choc-${page.id}"
data-title="<#if page.url.args.user??>I miei documenti<#elseif page.url.args.shared??>Documenti condivisi<#else>Titolario</#if>">
	<div class="ui grid">
		<div class="row">
			<div class="sixteen wide column">
				<div class="ui large breadcrumb" id="tit-breadcrumb"></div>
			</div>
		</div>
		<div class="row">
			<div class="nine wide column" id="tit-docs-area">
				<div id="tit-doclib" class="ui selection celled list"></div>
				<div id="tit-pagination2"><div class="pager"></div></div>

			</div><!-- col-md-7 -->
			<div class="seven wide column" id="tit-work-area">
				<div class="ui basic segment">
					<div class="ui left icon action fluid input" id="tit-advsearch">
						<input type="text" placeholder="Cerca..." id="tit-advsearch-q" onkeydown="Choc._searchSubmit(null, event);" aria-label="Ricerca">
						<i onclick="Choc._searchSubmit();" class="search icon cursor pointer"></i>
						<button class="ui red button" onclick="Choc._resetSearch();">Reset</button>
					</div>
					<div id="tit-advsearch-form"></div>
				</div>
				<div class="ui divider"></div>
				<div class="ui divided grid">
					<div class="six wide computer sixteen wide tablet column">
						<div class="ui header">Azioni</div>
						<div id="tit-actions">
							<!-- multiple actions -->
							<div id="tit-multiple-actions" class="hide">
								<div class="ui mini circular teal icon button right floated" onclick="Choc._deselectRow();"><i class="icon remove"></i></div>
								<div class="ui teal header">Azioni Multiple</div>
								<button class="ui small basic teal fluid button" onclick="Choc._multipleDownload();"><i class='icon download'></i>Download</button>
								<button class="ui small basic teal fluid button" onclick="Choc._multipleCopy();"><i class='icon copy'></i>Copia</button>
								<button class="ui small basic teal fluid button need-write" onclick="Choc._multipleMove();"><i class='icon cut'></i>Sposta</button>
								<button class="ui small basic teal fluid button need-write" onclick="Choc._multipleSign();"><i class='icon pencil'></i>Firma</button>
								<button class="ui small basic teal fluid button need-write" onclick="Choc._multipleDelete();"><i class='icon remove'></i>Elimina</button>
								<div class="ui divider"></div>
							</div>
							<!-- div for upload plugin -->
							<div class="hide tit-action-input">
								<div class="tit-action-input-ajax"></div>
							</div>
							<!-- action for upload -->
							<button class="ui small basic black fluid button tit-action-upload file-mode hide" onclick="$('#fileupload').click();"><i class='icon upload'></i>Carica da File</button>
                            <input class="hide" id='fileupload' type='file' name='filedata' multiple aria-label="Upload">
							<!-- generic folder actions -->
							<button class="ui small basic black fluid button tit-action-newdoc hide" onclick="Choc._createDoc();"><i class='icon file text'></i>Crea documento</button>
							<button class="ui small basic black fluid button tit-action-newfolder hide" onclick='Choc._folderCreate();'><i class='icon folder'></i>Nuova cartella</button>
							<button class="ui small basic black fluid button tit-action-bulkimport hide" onclick="Choc._importDocs();"><i class='icon disk outline'></i>Importa da Server</button>
							<!-- document actions -->
							<button class="ui small basic black fluid button tit-action-download hide" onclick="Choc.Actions.runAction('download', Choc.Docs.currentDoc);"><i class='icon download'></i>Download</button>
							<button class="ui small basic black fluid button tit-action-preview hide" onclick="Choc._showDoc();"><i class='icon eye'></i>Anteprima</button>
                            <button class="ui small basic black fluid button tit-action-rename hide" onclick="Choc._renameNode();"><i class='icon font'></i>Rinomina</button>
							<button class="ui small basic black fluid button tit-action-modify hide" onclick="Choc._editNode();"><i class='icon font'></i>Modifica</button>
                            <button class="ui small basic black fluid button tit-action-checkoutcanc hide" onclick="Choc._checkoutCancel();"><i class='icon delete'></i>Annulla Checkout</button>
							<button class="ui small basic black fluid button tit-action-copy hide" onclick="Choc._copyNode();"><i class='icon copy'></i>Copia</button>
							<button class="ui small basic black fluid button tit-action-move hide" onclick="Choc._moveNode();"><i class='icon cut'></i>Sposta</button>
							<button class="ui small basic black fluid button tit-action-meta hide" onclick="Choc._editMeta();"><i class='icon puzzle piece'></i>Metadati</button>
                            <button class="ui small basic black fluid button tit-action-newversion hide" onclick="Choc._loadVersion();" alt="Carica nuova versione"><i class='icon upload'></i>Carica nuova versione</button>
                            <button class="ui small basic black fluid button tit-action-ocr hide" onclick="Choc._makeOcr();" alt="Converti in PDF con OCR"><i class='clockwise rotated icon exchange'></i>Converti in PDF con OCR</button>
							<!-- folder actions -->
							<button class="ui small basic black fluid button tit-action-downloadzip hide" onclick='Choc._folderDownload()'><i class='icon download'></i>Download Zip</button>
							<!-- reg -->
							<button class="ui small basic black fluid button tit-action-newtitolo hide" onclick='Choc._titCreate("titolo")'><i class='icon folder'></i>Nuovo Titolo</button>
							<button class="ui small basic black fluid button tit-action-newclasse hide" onclick='Choc._titCreate("classe")'><i class='icon folder'></i>Nuova Classe</button>
							<button class="ui small basic black fluid button tit-action-newfascic hide" onclick='Choc._titCreate("fascicolo")'><i class='icon folder'></i>Nuovo Fascicolo</button>
							<button class="ui small basic black fluid button tit-action-closefasc hide" onclick="Choc._fascState();"><i class='icon lock'></i>Chiudi Fascicolo</button>
							<button class="ui small basic black fluid button tit-action-openfasc hide" onclick="Choc._fascState();"><i class='icon unlock'></i>Apri Fascicolo</button>
							<button class="ui small basic black fluid button tit-action-historify hide" onclick="Choc._titDelete();"><i class='icon suitcase'></i>Archivia</button>
							<!-- delete action for node and folders -->
                            <button class="ui small basic black fluid button tit-action-delete hide" onclick='Choc._nodeDelete();'><i class='icon remove'></i>Elimina</button>
							<button class="ui small basic black fluid button tit-action-perms hide" onclick="Choc._setPermissions();"><i class='icon plug'></i>Permessi</button>
                            <!-- action to see after search -->
                            <button class="ui small basic black fluid button tit-action-gotonode hide" onclick="Choc._gotoNode();"><i class='icon play'></i>Vai alla cartella</button>
						</div>
					</div>
					<div class="ten wide computer sixteen wide tablet column">
						<div class="ui header">Dettagli</div>
						<div class="ui divided relaxed list" id="tit-details"></div>
					</div><!-- column -->
				</div><!-- grid -->
			</div><!-- column -->
		</div> <!-- row -->
	</div><!-- grid -->	
</div>
<script type="text/javascript">
$(document).ready(function(){
	<#if page.url.args.user??>
	Choc.Docs.getUserHome(function(doclib){
		Choc.Docs.rootName = "I miei documenti";
		Choc.Docs.mode = "user";
	<#elseif page.url.args.shared??>
	Choc.Docs.getContainer("shared", function(doclib){
		Choc.Docs.rootName = "Documenti condivisi";
		Choc.Docs.mode = "shared";
	<#else>
	Choc.Docs.getContainer("documentLibrary", function(doclib){
		Choc.Docs.rootName = "Archivio";
		Choc.Docs.mode = "doclib";
	</#if>
		Choc.Docs.root = doclib.nodeRef;
		Choc.Docs.docs[doclib.nodeRef].properties["cm:name"] = Choc.Docs.rootName;
		<#if page.url.args.noderef??>
		Choc._gotoNode("${page.url.args.noderef}");
		<#else>
		Choc._doclibNext("<span data-noderef='"+doclib.nodeRef+"'></span>");
		</#if>
	});
	Choc._setupActions();
});
</script>
