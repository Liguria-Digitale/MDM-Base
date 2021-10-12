<#macro renderPickerHTML controlId>
	<#assign pickerId = controlId + "-picker">
	<div id="${pickerId}" class="picker yui-panel">
	   <div id="${pickerId}-head" class="hd">${msg("form.control.object-picker.header")}</div>

	   <div id="${pickerId}-body" class="bd">
		  <div class="picker-header">
			 <div id="${pickerId}-folderUpContainer" class="folder-up"><button id="${pickerId}-folderUp"></button></div>
			 <div id="${pickerId}-navigatorContainer" class="navigator">
				<button id="${pickerId}-navigator"></button>
				<div id="${pickerId}-navigatorMenu" class="yuimenu">
				   <div class="bd">
					  <ul id="${pickerId}-navigatorItems" class="navigator-items-list">
						 <li>&nbsp;</li>
					  </ul>
				   </div>
				</div>
			 </div>
			 <div id="${pickerId}-searchContainer" class="search">
				<input type="text" class="search-input" name="-" id="${pickerId}-searchText" value="" maxlength="256" />
				<span class="search-button"><button id="${pickerId}-searchButton">${msg("form.control.object-picker.search")}</button></span>
			 </div>
		  </div>
		  <div class="yui-g">
			 <div id="${pickerId}-left" class="yui-u first panel-left">
				<div id="${pickerId}-results" class="picker-items">
				   <#nested>
				</div>
			 </div>
			 <div id="${pickerId}-right" class="yui-u panel-right">
				<div id="${pickerId}-selectedItems" class="picker-items"></div>
			 </div>
		  </div>
		  <div class="bdft">
			 <button id="${controlId}-ok" tabindex="0">${msg("button.ok")}</button>
			 <button id="${controlId}-cancel" tabindex="0">${msg("button.cancel")}</button>
		  </div>
	   </div>

	</div>
</#macro>

<@markup id="css" >
   <#-- CSS Dependencies -->
   <@link href="${url.context}/res/components/object-finder/object-finder.css" group="console"/>
</@>

<@markup id="js">
	<#-- JavaScript Dependencies -->
	<@script src="${url.context}/res/components/object-finder/object-finder.js" group="console"/>
</@>

<@markup id="widgets">
   <@createWidgets group="console"/>
</@>

<@markup id="html">
	<style>
	.impElement {
		padding-top:6px;
		padding-bottom:6px;
		font-size:110%;
	}
	#imp-checkstatus {
		visibility: hidden;
	}
	</style>
	<@uniqueIdDiv>
	<div style="padding-left:20px;">
		<br/>
		<div>
			<label style="font-size:123%;">.mDM Importer</label>
		</div>
		<div class="impElement" style="padding-top:3px;padding-bottom:50px;">
			Inserire le informazioni per l'importazione ed avviare il processo.
		</div>
		<#-- INIZIO PICKER -->
		<#assign fieldHtmlId = "choc-imp-picker">
		<#assign controlId = "choc-imp-picker-cntrl">
		<div id="${controlId}" class="object-finder" style="padding-bottom:6px;">
			<div id="${controlId}-currentValueDisplay" class="current-values"></div>
            <input type="hidden" id="${fieldHtmlId}" name="-" value="" />
            <input type="hidden" id="${controlId}-added" name="imp-node_added" />
            <input type="hidden" id="${controlId}-removed" name="imp-node_removed" />
            <div id="${controlId}-itemGroupActions" class="show-picker"></div>
            <@renderPickerHTML controlId />
		</div>
		<div class="impElement">
			<label for="choc-imp-serverpath">Cartella di origine del server</label>
			<input type="text" id="choc-imp-serverpath" />
		</div>
		<div class="impElement">
			<label for="choc-imp-rules">Disabilita regole durante l'importazione</label>
			<input type="checkbox" id="choc-imp-rules" />
		</div>
		<div class="impElement">
			<label for="choc-imp-replace">Sovrascrivi file esistenti</label>
			<input type="checkbox" id="choc-imp-replace" />
		</div>
		<div class="impElement">
			<label for="choc-imp-batch">Batch Size</label>
			<input type="text" id="choc-imp-batch" style="width:50px;" />
		</div>
		<div class="impElement">
			<label for="choc-imp-threads">Numero di threads</label>
			<input type="text" id="choc-imp-threads" style="width:50px;" />
		</div>
		<div id="choc-imp-button" style="padding-top:20px;"></div>
		<script type="text/javascript">//<![CDATA[
			// creo il picker per selezionare la cartella
			new Alfresco.ObjectFinder("${controlId}", "${fieldHtmlId}").setOptions({
				field: "imp-node",
				compactMode: true,
				startLocation: "alfresco://company/home",
				selectActionLabel: "Seleziona cartella in cui salvare i file",
				showLinkToTarget: false,
				itemType: "cm:folder",
				multipleSelectMode: false,
				parentNodeRef: "alfresco://company/home",
				itemFamily: "node",
				displayMode: "items"
			}).setMessages(
				${messages}
			);
			<#-- FINE PICKER -->
			// creo una funzione di utility per i messaggi
			Alfresco.chocImpMessage = function(title,text){
				Alfresco.util.PopupManager.displayPrompt({
					title: title,
					text: text
				});
			}
			// creo il controller e il pulsante per l'importazione
			var importProcess = function() {
				var path = Dom.get("choc-imp-serverpath").value;
				if(path.length==0){
					Alfresco.chocImpMessage("Attenzione!", "Specifica il path del server da cui importare...");
					return;
				}
				var noderef = Dom.get("choc-imp-picker").value;
				if(noderef.length>0){
					Alfresco.util.Ajax.request({
						method: "POST",
						url: Alfresco.constants.PROXY_URI_RELATIVE + "bulkfsimport/initiate",
						dataObj: {
							sourceDirectory: path,
							targetPath:	"",
					        targetNodeRef: noderef,
					        batchSize: Dom.get("choc-imp-batch").value,
					        numThreads: Dom.get("choc-imp-threads").value,
					        disableRules: Dom.get("choc-imp-rules").checked ? "disableRules" : "",
					        replaceExisting: Dom.get("choc-imp-replace").checked ? "replaceExisting" : ""
						},
						successCallback: {
							fn: function(o){
								Dom.get("imp-checkstatus").style.visibility = "visible";
								Alfresco.chocImpMessage("Importazione", "Importazione partita. Puoi controllare lo stato dell'importazione cliccando sull'apposito tasto");
							}
						},
						failureCallback: {
							fn: function(o){
								Alfreso.chocImpMessage("Importazione", "Impossibile eseguire l'importazione");
							}
						}
					});
				} else {
					Alfresco.chocImpMessage("Importazione", "Devi selezionare una cartella!!");
				}
			};
			new YAHOO.widget.Button({
				id: "imp-import", 
				type: "button", 
				label: "Inizia Importazione", 
				container: "choc-imp-button",
				onclick: {
					fn: importProcess 
				}
			});
			new YAHOO.widget.Button({
				id: "imp-checkstatus", 
				type: "link", 
				label: "Check stato importazione", 
				container: "choc-imp-button",
				href: Alfresco.constants.PROXY_URI_RELATIVE + "bulkfsimport/status",
				target: "_blank"
			});
		//]]></script>
	</div>
	</@>
</@>
